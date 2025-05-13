import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { InvoicesModule } from '../invoices/invoices.module';
import { ReportsService } from './reports.service';

@Module({
  imports: [
    InvoicesModule,
    ClientsModule.register([
      {
        name: 'REPORTS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'daily_sales_report',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  providers: [ReportsService],
})
export class ReportsModule {} 