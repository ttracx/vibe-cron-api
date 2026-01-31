import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { CronExpressionParser, type CronExpressionOptions } from 'cron-parser';
import cronstrue from 'cronstrue';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Parse cron expression and return next N run times
app.post('/parse', (req: Request, res: Response) => {
  try {
    const { expression, count = 5, tz } = req.body;

    if (!expression) {
      res.status(400).json({ error: 'Missing required field: expression' });
      return;
    }

    const options: CronExpressionOptions = {};
    if (tz) options.tz = tz;

    const interval = CronExpressionParser.parse(expression, options);
    const nextRuns: string[] = [];

    for (let i = 0; i < Math.min(count, 100); i++) {
      if (!interval.hasNext()) break;
      const cronDate = interval.next();
      nextRuns.push(cronDate.toDate().toISOString());
    }

    res.json({
      expression,
      timezone: tz || 'UTC',
      count: nextRuns.length,
      nextRuns
    });
  } catch (error) {
    res.status(400).json({
      error: 'Invalid cron expression',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Validate cron expression
app.post('/validate', (req: Request, res: Response) => {
  try {
    const { expression } = req.body;

    if (!expression) {
      res.status(400).json({ error: 'Missing required field: expression' });
      return;
    }

    CronExpressionParser.parse(expression);

    res.json({
      expression,
      valid: true
    });
  } catch (error) {
    res.json({
      expression: req.body.expression,
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Human-readable description of cron expression
app.post('/describe', (req: Request, res: Response) => {
  try {
    const { expression, locale = 'en' } = req.body;

    if (!expression) {
      res.status(400).json({ error: 'Missing required field: expression' });
      return;
    }

    // Validate expression first
    CronExpressionParser.parse(expression);

    const description = cronstrue.toString(expression, {
      locale,
      use24HourTimeFormat: true
    });

    res.json({
      expression,
      description
    });
  } catch (error) {
    res.status(400).json({
      error: 'Invalid cron expression',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all runs between two dates
app.post('/between', (req: Request, res: Response) => {
  try {
    const { expression, startDate, endDate, tz, limit = 1000 } = req.body;

    if (!expression || !startDate || !endDate) {
      res.status(400).json({
        error: 'Missing required fields: expression, startDate, endDate'
      });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      res.status(400).json({ error: 'Invalid date format' });
      return;
    }

    if (start >= end) {
      res.status(400).json({ error: 'startDate must be before endDate' });
      return;
    }

    const options: CronExpressionOptions = {
      currentDate: start,
      endDate: end
    };
    if (tz) options.tz = tz;

    const interval = CronExpressionParser.parse(expression, options);
    const runs: string[] = [];

    while (runs.length < limit && interval.hasNext()) {
      try {
        const cronDate = interval.next();
        runs.push(cronDate.toDate().toISOString());
      } catch {
        // Iterator exhausted - this is expected when we reach endDate
        break;
      }
    }

    res.json({
      expression,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      timezone: tz || 'UTC',
      count: runs.length,
      runs
    });
  } catch (error) {
    res.status(400).json({
      error: 'Invalid cron expression or parameters',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🕐 vibe-cron-api running on port ${PORT}`);
});
