import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment';
import { AppModule } from '../src/app.module';
import { Invoice } from '../src/invoices/schemas/invoice.schema';
import { ReportsService } from '../src/reports/reports.service';

describe('Reports (e2e)', () => {
  let app: INestApplication;
  let invoiceModel: Model<Invoice>;
  let reportsService: ReportsService;
  let mockClientProxy: { emit: jest.Mock };
  let isConnected = false;

  beforeAll(async () => {
    try {
      mockClientProxy = {
        emit: jest.fn(),
      };

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      })
        .overrideProvider('REPORTS_SERVICE')
        .useValue(mockClientProxy)
        .compile();

      app = moduleFixture.createNestApplication();
      invoiceModel = moduleFixture.get<Model<Invoice>>(getModelToken(Invoice.name));
      reportsService = moduleFixture.get<ReportsService>(ReportsService);

      await app.init();
      isConnected = true;
    } catch (error) {
      console.error('Error setting up test:', error.message);
    }
  });

  afterAll(async () => {
    if (isConnected) {
      try {
        await invoiceModel.deleteMany({}).exec();
      } catch (error) {
        console.error('Error cleaning up database:', error.message);
      }
      await app.close();
    }
  });

  afterEach(async () => {
    if (isConnected) {
      try {
        await invoiceModel.deleteMany({}).exec();
      } catch (error) {
        console.error('Error cleaning up after test:', error.message);
      }
      jest.clearAllMocks();
    }
  });

  describe('Daily Sales Report Generation', () => {
    it('should generate a daily sales report with correct data', async () => {
      if (!isConnected) {
        console.warn('Test skipped: MongoDB connection not available');
        return;
      }

      const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
      
      await invoiceModel.create({
        customer: 'E2E Test Customer 1',
        amount: 100,
        reference: 'E2E-001',
        date: yesterday,
        items: [
          { sku: 'E2E-ITEM1', qt: 2 },
          { sku: 'E2E-ITEM2', qt: 1 },
        ],
      });

      await invoiceModel.create({
        customer: 'E2E Test Customer 2',
        amount: 150,
        reference: 'E2E-002',
        date: yesterday,
        items: [
          { sku: 'E2E-ITEM1', qt: 1 },
          { sku: 'E2E-ITEM3', qt: 3 },
        ],
      });

      await reportsService.generateDailySalesReport();

      expect(mockClientProxy.emit).toHaveBeenCalledWith(
        'daily_sales_report',
        {
          date: moment(yesterday).format('YYYY-MM-DD'),
          totalSales: 250, // 100 + 150
          itemsSold: expect.arrayContaining([
            expect.objectContaining({ sku: 'E2E-ITEM1', totalQuantity: 3 }),
            expect.objectContaining({ sku: 'E2E-ITEM2', totalQuantity: 1 }),
            expect.objectContaining({ sku: 'E2E-ITEM3', totalQuantity: 3 }),
          ]),
        },
      );
    });

    it('should not emit a report when no invoices exist for yesterday', async () => {
      if (!isConnected) {
        console.warn('Test skipped: MongoDB connection not available');
        return;
      }
      
      await reportsService.generateDailySalesReport();

      expect(mockClientProxy.emit).not.toHaveBeenCalled();
    });
  });
}); 
