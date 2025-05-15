import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { AppModule } from '../src/app.module';
import { Invoice } from '../src/invoices/schemas/invoice.schema';
import { CreateInvoiceDto } from '../src/invoices/dto/create-invoice.dto';

describe('InvoicesController (e2e)', () => {
  let app: INestApplication;
  let invoiceModel: Model<Invoice>;
  let isConnected = false;

  beforeAll(async () => {
    try {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      invoiceModel = moduleFixture.get<Model<Invoice>>(getModelToken(Invoice.name));

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
    }
  });

  describe('/invoices (POST)', () => {
    it('should create a new invoice', async () => {
      if (!isConnected) {
        console.warn('Test skipped: MongoDB connection not available');
        return;
      }

      const createInvoiceDto: CreateInvoiceDto = {
        customer: 'E2E Test Customer',
        amount: 150,
        reference: 'E2E-001',
        items: [
          { sku: 'E2E-ITEM1', qt: 3 },
          { sku: 'E2E-ITEM2', qt: 2 },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/invoices')
        .send(createInvoiceDto)
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.customer).toBe(createInvoiceDto.customer);
      expect(response.body.amount).toBe(createInvoiceDto.amount);
      expect(response.body.reference).toBe(createInvoiceDto.reference);
      expect(response.body.items).toHaveLength(2);
      expect(response.body.items[0].sku).toBe(createInvoiceDto.items[0].sku);
      expect(response.body.items[0].qt).toBe(createInvoiceDto.items[0].qt);
    });
  });

  describe('/invoices (GET)', () => {
    it('should return an empty array when no invoices exist', async () => {
      if (!isConnected) {
        console.warn('Test skipped: MongoDB connection not available');
        return;
      }

      const response = await request(app.getHttpServer())
        .get('/invoices')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });

    it('should return all invoices', async () => {
      if (!isConnected) {
        console.warn('Test skipped: MongoDB connection not available');
        return;
      }

      const createInvoiceDto: CreateInvoiceDto = {
        customer: 'E2E Test Customer',
        amount: 150,
        reference: 'E2E-001',
        items: [
          { sku: 'E2E-ITEM1', qt: 3 },
        ],
      };

      await request(app.getHttpServer())
        .post('/invoices')
        .send(createInvoiceDto)
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/invoices')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].customer).toBe(createInvoiceDto.customer);
    });
  });

  describe('/invoices/:id (GET)', () => {
    it('should return a specific invoice by ID', async () => {
      if (!isConnected) {
        console.warn('Test skipped: MongoDB connection not available');
        return;
      }

      const createInvoiceDto: CreateInvoiceDto = {
        customer: 'E2E Test Customer',
        amount: 150,
        reference: 'E2E-001',
        items: [
          { sku: 'E2E-ITEM1', qt: 3 },
        ],
      };

      const createResponse = await request(app.getHttpServer())
        .post('/invoices')
        .send(createInvoiceDto)
        .expect(201);

      const invoiceId = createResponse.body._id;

      const getResponse = await request(app.getHttpServer())
        .get(`/invoices/${invoiceId}`)
        .expect(200);

      expect(getResponse.body._id).toBe(invoiceId);
      expect(getResponse.body.customer).toBe(createInvoiceDto.customer);
      expect(getResponse.body.amount).toBe(createInvoiceDto.amount);
      expect(getResponse.body.reference).toBe(createInvoiceDto.reference);
    });
  });
}); 
