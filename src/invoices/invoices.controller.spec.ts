import { Test, TestingModule } from '@nestjs/testing';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

describe('InvoicesController', () => {
  let controller: InvoicesController;
  let service: InvoicesService;

  const mockInvoice = {
    _id: 'some-id',
    customer: 'Test Customer',
    amount: 100,
    reference: 'INV-001',
    date: new Date(),
    items: [
      { sku: 'ITEM1', qt: 2 },
      { sku: 'ITEM2', qt: 1 },
    ],
  };

  const mockInvoicesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvoicesController],
      providers: [
        {
          provide: InvoicesService,
          useValue: mockInvoicesService,
        },
      ],
    }).compile();

    controller = module.get<InvoicesController>(InvoicesController);
    service = module.get<InvoicesService>(InvoicesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new invoice', async () => {
      const createInvoiceDto: CreateInvoiceDto = {
        customer: 'Test Customer',
        amount: 100,
        reference: 'INV-001',
        items: [
          { sku: 'ITEM1', qt: 2 },
          { sku: 'ITEM2', qt: 1 },
        ],
      };

      const createSpy = jest.spyOn(service, 'create').mockResolvedValueOnce(mockInvoice as any);

      const result = await controller.create(createInvoiceDto);

      expect(createSpy).toHaveBeenCalledWith(createInvoiceDto);
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('findAll', () => {
    it('should return an array of invoices', async () => {
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValueOnce([mockInvoice] as any);

      const result = await controller.findAll();

      expect(findAllSpy).toHaveBeenCalled();
      expect(result).toEqual([mockInvoice]);
    });

    it('should pass date filters to service', async () => {
      const startDate = '2023-01-01';
      const endDate = '2023-01-31';
      
      const findAllSpy = jest.spyOn(service, 'findAll').mockResolvedValueOnce([mockInvoice] as any);

      const result = await controller.findAll(startDate, endDate);

      expect(findAllSpy).toHaveBeenCalledWith(new Date(startDate), new Date(endDate));
      expect(result).toEqual([mockInvoice]);
    });
  });

  describe('findOne', () => {
    it('should return a single invoice', async () => {
      const findOneSpy = jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockInvoice as any);

      const result = await controller.findOne('some-id');

      expect(findOneSpy).toHaveBeenCalledWith('some-id');
      expect(result).toEqual(mockInvoice);
    });
  });
}); 
