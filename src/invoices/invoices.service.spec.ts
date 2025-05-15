import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { InvoicesService } from './invoices.service';
import { Invoice } from './schemas/invoice.schema';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

// Mock invoice data
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

// Mock implementation for Mongoose's Model class
class InvoiceModelMock {
  constructor(private data) {}
  
  save = jest.fn().mockResolvedValue(mockInvoice);
  
  static find = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockInvoice]),
  });
  
  static findById = jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockInvoice),
  });
}

describe('InvoicesService', () => {
  let service: InvoicesService;

  beforeEach(async () => {
    // Clear all mock implementations
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getModelToken(Invoice.name),
          useValue: InvoiceModelMock,
        },
      ],
    }).compile();

    service = module.get<InvoicesService>(InvoicesService);
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
      
      const result = await service.create(createInvoiceDto);
      
      expect(result).toEqual(mockInvoice);
    });
  });

  describe('findAll', () => {
    it('should return an array of invoices', async () => {
      const findSpy = jest.spyOn(InvoiceModelMock, 'find');
      
      const result = await service.findAll();
      
      expect(findSpy).toHaveBeenCalledWith({});
      expect(result).toEqual([mockInvoice]);
    });

    it('should filter by date range when provided', async () => {
      const startDate = new Date('2025-05-01');
      const endDate = new Date('2025-05-31');
      const findSpy = jest.spyOn(InvoiceModelMock, 'find');
      
      const result = await service.findAll(startDate, endDate);
      
      expect(findSpy).toHaveBeenCalledWith({
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
      const findByIdSpy = jest.spyOn(InvoiceModelMock, 'findById');
      
      const result = await service.findOne('some-id');
      
      expect(findByIdSpy).toHaveBeenCalledWith('some-id');
      expect(result).toEqual(mockInvoice);
    });
  });
}); 
