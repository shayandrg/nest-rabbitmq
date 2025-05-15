import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    
    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';
    console.log('rabbiiiiiiiiiiiit', rabbitmqUrl);
    
    app.connectMicroservice({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitmqUrl],
        queue: 'daily_sales_report',
        queueOptions: {
          durable: true,
        },
        prefetchCount: 1,
        noAck: false,
        persistent: true,
        socketOptions: {
          heartbeatIntervalInSeconds: 5,
          reconnectTimeInSeconds: 5,
        },
      },
    });

    await app.startAllMicroservices();
    await app.listen(3000);
  } catch (error) {
    console.error(`Failed to start application: ${error.message}`, error.stack);
    process.exit(1);
  }
}
bootstrap();
