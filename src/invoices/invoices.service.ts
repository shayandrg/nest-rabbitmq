import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './schemas/invoice.schema';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<Invoice>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const newInvoice = new this.invoiceModel(createInvoiceDto);
    return newInvoice.save();
  }

  async findAll(startDate?: Date, endDate?: Date): Promise<Invoice[]> {
    let query = {};

    if (startDate || endDate) {
      query = {
        date: {
          ...(startDate && { $gte: startDate }),
          ...(endDate && { $lte: endDate }),
        },
      };
    }

    return this.invoiceModel.find(query).exec();
  }

  async findOne(id: string): Promise<Invoice> {
    return this.invoiceModel.findById(id).exec();
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Invoice[]> {
    return this.invoiceModel.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).exec();
  }
} 