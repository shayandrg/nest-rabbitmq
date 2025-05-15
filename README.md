# Invoice & Daily Sales Report System

## Tech Stack

- **NestJS** - **MongoDB** - **RabbitMQ** - **Jest** - **Docker**

## Getting Started

#### Installing dependencies
```bash
npm install
```

#### Environment Variables
Create a `.env` file with the `.env.example`

#### Running the Application Docker

```bash
docker compose up
```

#### Testing
```bash
# Unit tests
npm run test
## last result:
# Tests: 23 passed, 23 total


# E2E tests (with docker)
npm run test:e2e
## last result:
# Tests: 1 todo, 8 passed, 9 total
```
#### Formatting
```bash
npm run lint
```

## Cron Jobs
daily at 12:00 PM
