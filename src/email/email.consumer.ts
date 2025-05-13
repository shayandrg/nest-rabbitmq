import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport, RmqContext, Ctx, Payload, RmqOptions, ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { EmailService } from './email.service';

interface DailySalesReport {
  date: string;
  totalSales: number;
  itemsSold: Array<{
    sku: string;
    totalQuantity: number;
  }>;
}

@Injectable()
export class EmailConsumer implements OnModuleInit {
  private readonly logger = new Logger(EmailConsumer.name);
  private client: ClientProxy;

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const options: RmqOptions = {
      transport: Transport.RMQ,
      options: {
        urls: [this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672'],
        queue: 'daily_sales_report',
        queueOptions: {
          durable: true,
        },
        noAck: false,
      },
    };

    this.client = ClientProxyFactory.create(options);

    this.client.connect().then(() => {
      this.logger.log('Connected to RabbitMQ');
      
      this.client
        .createSubscriptionObservable('daily_sales_report', { noAck: false })
        .subscribe({
          next: ({ data, ack }: { data: any; ack: () => void }) => {
            this.handleDailySalesReport(data);
            ack();
          },
          error: (error) => {
            this.logger.error('Subscription error', error);
          },
        });
    });
  }

  private async handleDailySalesReport(@Payload() data: DailySalesReport, @Ctx() context?: RmqContext) {
    this.logger.log(`Received daily sales report for ${data.date}`);
    
    try {
      const subject = `Daily Sales Report - ${data.date}`;
      const recipients = this.configService.get<string>('REPORT_RECIPIENTS') || 'admin@example.com';
      
      // Create HTML content for the email
      const html = this.createReportHtml(data);
      const text = this.createReportText(data);
      
      await this.emailService.sendEmail(recipients, subject, text, html);
      
      this.logger.log(`Sales report for ${data.date} sent successfully`);
    } catch (error) {
      this.logger.error(`Error sending sales report: ${error.message}`, error.stack);
    }
  }

  private createReportHtml(report: DailySalesReport): string {
    return `
      <h1>Daily Sales Report - ${report.date}</h1>
      <p><strong>Total Sales:</strong> $${report.totalSales.toFixed(2)}</p>
      
      <h2>Items Sold</h2>
      <table border="1" cellpadding="5" cellspacing="0">
        <tr>
          <th>SKU</th>
          <th>Total Quantity</th>
        </tr>
        ${report.itemsSold.map(item => `
          <tr>
            <td>${item.sku}</td>
            <td>${item.totalQuantity}</td>
          </tr>
        `).join('')}
      </table>
    `;
  }

  private createReportText(report: DailySalesReport): string {
    return `
      Daily Sales Report - ${report.date}
      
      Total Sales: $${report.totalSales.toFixed(2)}
      
      Items Sold:
      ${report.itemsSold.map(item => `SKU: ${item.sku}, Quantity: ${item.totalQuantity}`).join('\n')}
    `;
  }
} 