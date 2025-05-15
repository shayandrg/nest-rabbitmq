jest.setTimeout(20000);

process.env.MONGODB_URI = 'mongodb://localhost:27017/invoice_test';
process.env.RABBITMQ_URL = 'amqp://guest:guest@localhost:5672';
process.env.NODE_ENV = 'test'; 
