# vibe-cron-api 🕐

A simple, fast Express/TypeScript API for parsing and working with cron expressions.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Features

- **Parse** cron expressions and get next N run times
- **Validate** cron expressions
- **Describe** cron expressions in human-readable format
- **Between** - get all runs between two dates
- Timezone support
- Docker ready

## Endpoints

### `GET /health`

Health check endpoint.

```bash
curl https://vibe-cron-api.onrender.com/health
```

```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### `POST /parse`

Parse a cron expression and return the next N run times.

```bash
curl -X POST https://vibe-cron-api.onrender.com/parse \
  -H "Content-Type: application/json" \
  -d '{"expression": "0 9 * * 1-5", "count": 5, "tz": "America/New_York"}'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| expression | string | ✅ | Cron expression |
| count | number | ❌ | Number of runs (default: 5, max: 100) |
| tz | string | ❌ | Timezone (default: UTC) |

```json
{
  "expression": "0 9 * * 1-5",
  "timezone": "America/New_York",
  "count": 5,
  "nextRuns": [
    "2025-01-15T14:00:00.000Z",
    "2025-01-16T14:00:00.000Z",
    "2025-01-17T14:00:00.000Z",
    "2025-01-20T14:00:00.000Z",
    "2025-01-21T14:00:00.000Z"
  ]
}
```

### `POST /validate`

Check if a cron expression is valid.

```bash
curl -X POST https://vibe-cron-api.onrender.com/validate \
  -H "Content-Type: application/json" \
  -d '{"expression": "*/15 * * * *"}'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| expression | string | ✅ | Cron expression to validate |

```json
{
  "expression": "*/15 * * * *",
  "valid": true
}
```

### `POST /describe`

Get a human-readable description of a cron expression.

```bash
curl -X POST https://vibe-cron-api.onrender.com/describe \
  -H "Content-Type: application/json" \
  -d '{"expression": "0 9 * * 1-5"}'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| expression | string | ✅ | Cron expression |
| locale | string | ❌ | Locale for description (default: en) |

```json
{
  "expression": "0 9 * * 1-5",
  "description": "At 09:00, Monday through Friday"
}
```

### `POST /between`

Get all cron runs between two dates.

```bash
curl -X POST https://vibe-cron-api.onrender.com/between \
  -H "Content-Type: application/json" \
  -d '{
    "expression": "0 12 * * *",
    "startDate": "2025-01-01T00:00:00Z",
    "endDate": "2025-01-07T00:00:00Z"
  }'
```

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| expression | string | ✅ | Cron expression |
| startDate | string | ✅ | Start date (ISO 8601) |
| endDate | string | ✅ | End date (ISO 8601) |
| tz | string | ❌ | Timezone (default: UTC) |
| limit | number | ❌ | Max results (default: 1000) |

```json
{
  "expression": "0 12 * * *",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-01-07T00:00:00.000Z",
  "timezone": "UTC",
  "count": 6,
  "runs": [
    "2025-01-01T12:00:00.000Z",
    "2025-01-02T12:00:00.000Z",
    "2025-01-03T12:00:00.000Z",
    "2025-01-04T12:00:00.000Z",
    "2025-01-05T12:00:00.000Z",
    "2025-01-06T12:00:00.000Z"
  ]
}
```

## Cron Expression Format

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-7, 0 and 7 = Sunday)
│ │ │ │ │
* * * * *
```

### Common Examples

| Expression | Description |
|------------|-------------|
| `* * * * *` | Every minute |
| `*/15 * * * *` | Every 15 minutes |
| `0 * * * *` | Every hour |
| `0 9 * * *` | Every day at 9:00 AM |
| `0 9 * * 1-5` | Weekdays at 9:00 AM |
| `0 0 1 * *` | First day of every month |
| `0 0 * * 0` | Every Sunday at midnight |

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Start production server
npm start
```

## Docker

```bash
# Build
docker build -t vibe-cron-api .

# Run
docker run -p 3000:3000 vibe-cron-api
```

## Deploy to Render

1. Fork this repository
2. Create a new Web Service on Render
3. Connect your GitHub repo
4. Render will auto-detect the Dockerfile

Or use the [render.yaml](./render.yaml) blueprint for one-click deployment.

## Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **cron-parser** - Cron expression parsing
- **cronstrue** - Human-readable descriptions
- **Docker** - Containerization

## License

MIT
