# Invoice & Daily Sales Report System

A complete system for managing invoices and generating daily sales reports, built with NestJS, MongoDB, and RabbitMQ.

## Features

- **Invoice Management**: Create and retrieve invoices through a RESTful API
- **Daily Sales Reports**: Automatically generate and email daily sales reports at noon
- **Message Queue**: Process reports asynchronously using RabbitMQ
- **Email Notifications**: Send beautifully formatted sales reports via email

## Tech Stack

- **NestJS**: Progressive Node.js framework for building server-side applications
- **MongoDB**: NoSQL database for storing invoice data
- **RabbitMQ**: Message broker for asynchronous processing
- **Jest & Supertest**: Testing tools for unit and integration tests
- **Docker & Docker Compose**: For easy deployment and development

## Project Structure

```
invoice-system/
├── src/
│   ├── invoices/           # Invoice management module
│   ├── reports/            # Report generation module
│   ├── email/              # Email service module
│   └── app.module.ts       # Main application module
├── test/                   # End-to-end tests
├── docker-compose.yml      # Docker compose configuration
└── Dockerfile              # Docker configuration
```

## Getting Started

### Prerequisites

- Node.js (16+)
- Docker and Docker Compose (optional, for running with containers)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Running the Application

#### Using Docker

```bash
docker-compose up
```

This will start:
- The NestJS application on port 3000
- MongoDB on port 27017
- RabbitMQ on port 5672 (Management UI on port 15672)

#### Without Docker

1. Make sure you have MongoDB and RabbitMQ running locally
2. Create a `.env` file based on the example below
3. Run the application:

```bash
npm run start:dev
```

### Environment Variables

Create a `.env` file with the following variables:

```
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/invoice-system
RABBITMQ_URL=amqp://localhost:5672
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=user@example.com
EMAIL_PASSWORD=password
EMAIL_FROM=noreply@example.com
REPORT_RECIPIENTS=admin@example.com
```

## API Endpoints

### Invoice API

- `POST /invoices` - Create a new invoice
- `GET /invoices` - Get all invoices (with optional date filters)
- `GET /invoices/:id` - Get a specific invoice by ID

### Request Examples

#### Create Invoice

```http
POST /invoices
Content-Type: application/json

{
  "customer": "ACME Corp",
  "amount": 1250.50,
  "reference": "INV-2023-001",
  "items": [
    {
      "sku": "PROD-001",
      "qt": 5
    },
    {
      "sku": "PROD-002",
      "qt": 10
    }
  ]
}
```

#### Get Invoices with Date Filter

```http
GET /invoices?startDate=2023-01-01&endDate=2023-01-31
```

## Testing

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Cron Jobs

The application has a scheduled job that runs daily at 12:00 PM to:

1. Calculate the total sales for the previous day
2. Calculate quantities sold per item (grouped by SKU)
3. Send the report to a RabbitMQ queue
4. Process the queue and send an email with the report

## License

This project is licensed under the MIT License.
