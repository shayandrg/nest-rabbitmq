import { Test, TestingModule } from '@nestjs/testing';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { ReportsService } from './reports.service';
import { InvoicesService } from '../invoices/invoices.service';

// Create a partial type for Invoice to use in tests
type MockInvoice = {
  _id: string;
  customer: string;
  reference: string;
  amount: number;
  date: Date;
  items: Array<{ sku: string; qt: number }>;
};

describe('ReportsService', () => {
  let service: ReportsService;
  
  const mockInvoicesService = {
    findByDateRange: jest.fn(),
  };
  
  const mockClientProxy = {
    emit: jest.fn(),
  };
  
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: InvoicesService,
          useValue: mockInvoicesService,
        },
        {
          provide: 'REPORTS_SERVICE',
          useValue: mockClientProxy,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateDailySalesReport', () => {
    it('should generate and emit a sales report for yesterday', async () => {
      // Mock date
      const yesterday = moment().subtract(1, 'day').startOf('day').toDate();
      
      // Mock invoices
      const mockInvoices = [
        {
          _id: '1',
          customer: 'Customer 1',
          reference: 'INV-001',
          amount: 100,
          date: yesterday,
          items: [
            { sku: 'ITEM1', qt: 2 },
            { sku: 'ITEM2', qt: 1 },
          ],
        },
        {
          _id: '2',
          customer: 'Customer 2',
          reference: 'INV-002',
          amount: 200,
          date: yesterday,
          items: [
            { sku: 'ITEM1', qt: 1 },
            { sku: 'ITEM3', qt: 3 },
          ],
        },
      ] as MockInvoice[];

      mockInvoicesService.findByDateRange.mockResolvedValue(mockInvoices);

      await service.generateDailySalesReport();

      // Verify invoices service was called with correct date range
      expect(mockInvoicesService.findByDateRange).toHaveBeenCalledWith(
        expect.any(Date),
        expect.any(Date),
      );

      // Verify the report was emitted with correct data
      expect(mockClientProxy.emit).toHaveBeenCalledWith(
        'daily_sales_report',
        {
          date: moment(yesterday).format('YYYY-MM-DD'),
          totalSales: 300, // 100 + 200
          itemsSold: expect.arrayContaining([
            expect.objectContaining({ sku: 'ITEM1', totalQuantity: 3 }),
            expect.objectContaining({ sku: 'ITEM2', totalQuantity: 1 }),
            expect.objectContaining({ sku: 'ITEM3', totalQuantity: 3 }),
          ]),
        },
      );
    });

    it('should not emit a report when no invoices found', async () => {
      mockInvoicesService.findByDateRange.mockResolvedValue([]);

      await service.generateDailySalesReport();

      expect(mockInvoicesService.findByDateRange).toHaveBeenCalled();
      expect(mockClientProxy.emit).not.toHaveBeenCalled();
    });
  });

  describe('createSalesReport', () => {
    it('should correctly transform invoices into a sales report', () => {
      const date = new Date('2023-12-01');
      const invoices = [
        {
          _id: '1',
          customer: 'Customer 1',
          reference: 'INV-001',
          amount: 100,
          date: date,
          items: [
            { sku: 'ITEM1', qt: 2 },
            { sku: 'ITEM2', qt: 1 },
          ],
        },
        {
          _id: '2',
          customer: 'Customer 2',
          reference: 'INV-002',
          amount: 200,
          date: date,
          items: [
            { sku: 'ITEM1', qt: 1 },
            { sku: 'ITEM3', qt: 3 },
          ],
        },
      ] as MockInvoice[];

      // Access private method
      const report = (service as any).createSalesReport(invoices, date);

      expect(report).toEqual({
        date: '2023-12-01',
        totalSales: 300,
        itemsSold: expect.arrayContaining([
          expect.objectContaining({ sku: 'ITEM1', totalQuantity: 3 }),
          expect.objectContaining({ sku: 'ITEM2', totalQuantity: 1 }),
          expect.objectContaining({ sku: 'ITEM3', totalQuantity: 3 }),
        ]),
      });
    });
  });
}); 
