import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';
import { InvoicesService } from '../invoices/invoices.service';
import { Invoice } from '../invoices/schemas/invoice.schema';

interface DailySalesReport {
  date: string;
  totalSales: number;
  itemsSold: Array<{
    sku: string;
    totalQuantity: number;
  }>;
}

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly invoicesService: InvoicesService,
    @Inject('REPORTS_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async generateDailySalesReport() {
    this.logger.log('Generating daily sales report...');

    const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
    const today = moment().startOf('day').toDate();

    const invoices = await this.invoicesService.findByDateRange(yesterday, today);
    
    if (invoices.length === 0) {
      this.logger.log('No sales for yesterday. Skipping report generation.');
      return;
    }

    const report = this.createSalesReport(invoices, yesterday);
    
    this.logger.log(`Sending report to queue for date: ${report.date}`);
    this.client.emit('daily_sales_report', report);
  }

  private createSalesReport(invoices: Invoice[], date: Date): DailySalesReport {
    const totalSales = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    
    const skuMap = new Map<string, number>();
    
    invoices.forEach(invoice => {
      invoice.items.forEach(item => {
        const currentQt = skuMap.get(item.sku) || 0;
        skuMap.set(item.sku, currentQt + item.qt);
      });
    });
    
    const itemsSold = Array.from(skuMap.entries()).map(([sku, totalQuantity]) => ({
      sku,
      totalQuantity,
    }));
    
    return {
      date: moment(date).format('YYYY-MM-DD'),
      totalSales,
      itemsSold,
    };
  }
} 
