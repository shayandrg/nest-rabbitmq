import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InvoicesService } from './invoices.service';
import { Invoice } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

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

describe('InvoicesService', () => {
  let service: InvoicesService;
  let model: Model<Invoice>;

  const mockInvoiceModel = {
    new: jest.fn().mockResolvedValue(mockInvoice),
    constructor: jest.fn().mockResolvedValue(mockInvoice),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getModelToken(Invoice.name),
          useValue: mockInvoiceModel,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
    model = module.get<Model<Invoice>>(getModelToken(Invoice.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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

      jest.spyOn(model, 'save').mockResolvedValueOnce(mockInvoice as any);
      
      const result = await service.create(createInvoiceDto);
      
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('findAll', () => {
    it('should return an array of invoices', async () => {
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockInvoice]),
      } as any);
      
      const result = await service.findAll();
      
      expect(result).toEqual([mockInvoice]);
    });

    it('should filter by date range when provided', async () => {
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');
      
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([mockInvoice]),
      } as any);
      
      const result = await service.findAll(startDate, endDate);
      
      expect(model.find).toHaveBeenCalledWith({
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      });
      expect(result).toEqual([mockInvoice]);
    });
  });

  describe('findOne', () => {
    it('should find and return an invoice by id', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockInvoice),
      } as any);
      
      const result = await service.findOne('some-id');
      
      expect(model.findById).toHaveBeenCalledWith('some-id');
      expect(result).toEqual(mockInvoice);
    });
  });
}); 