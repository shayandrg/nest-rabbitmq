import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InvoicesModule } from '../invoices/invoices.module';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    InvoicesModule,
    ClientsModule.registerAsync([
      {
        name: 'REPORTS_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          const rabbitmqUrl = configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@rabbitmq:5672';

          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitmqUrl],
              queue: 'daily_sales_report',
              queueOptions: {
                durable: true,
              },
              socketOptions: { 
                heartbeatIntervalInSeconds: 5,
                reconnectTimeInSeconds: 5,
              },
            },
          };
        },
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [ReportsService],
})
export class ReportsModule {} 
