import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailConsumer } from './email.consumer';
import { EmailService } from './email.service';

describe('EmailConsumer', () => {
  let consumer: EmailConsumer;

  const mockEmailService = {
    sendEmail: jest.fn().mockResolvedValue(true),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'REPORT_RECIPIENTS') return 'admin@example.com';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailConsumer,
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    consumer = module.get<EmailConsumer>(EmailConsumer);
  });

  it('should be defined', () => {
    expect(consumer).toBeDefined();
  });

  describe('handleDailySalesReport', () => {
    it('should send report email to configured recipients', async () => {
      const salesReport = {
        date: '2023-12-01',
        totalSales: 1000,
        itemsSold: [
          { sku: 'ITEM1', totalQuantity: 5 },
          { sku: 'ITEM2', totalQuantity: 3 },
        ],
      };

      await consumer.handleDailySalesReport(salesReport);

      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'admin@example.com',
        'Daily Sales Report - 2023-12-01',
        expect.any(String), // Check text content
        expect.any(String), // Check HTML content
      );
    });

    it('should handle errors gracefully', async () => {
      const salesReport = {
        date: '2023-12-01',
        totalSales: 1000,
        itemsSold: [
          { sku: 'ITEM1', totalQuantity: 5 },
        ],
      };

      mockEmailService.sendEmail.mockRejectedValueOnce(new Error('Email sending failed'));

      // This should not throw an error
      await expect(consumer.handleDailySalesReport(salesReport)).resolves.not.toThrow();
    });
  });

  describe('createReportHtml', () => {
    it('should generate HTML content for email', () => {
      const salesReport = {
        date: '2023-12-01',
        totalSales: 1000,
        itemsSold: [
          { sku: 'ITEM1', totalQuantity: 5 },
        ],
      };

      // Access private method using any type
      const html = (consumer as any).createReportHtml(salesReport);

      expect(html).toContain('Daily Sales Report - 2023-12-01');
      expect(html).toContain('$1000.00');
      expect(html).toContain('ITEM1');
      expect(html).toContain('5');
    });
  });

  describe('createReportText', () => {
    it('should generate text content for email', () => {
      const salesReport = {
        date: '2023-12-01',
        totalSales: 1000,
        itemsSold: [
          { sku: 'ITEM1', totalQuantity: 5 },
        ],
      };

      // Access private method using any type
      const text = (consumer as any).createReportText(salesReport);

      expect(text).toContain('Daily Sales Report - 2023-12-01');
      expect(text).toContain('$1000.00');
      expect(text).toContain('SKU: ITEM1, Quantity: 5');
    });
  });
}); 
