import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoicesService } from './invoices.service';
import { Invoice } from './schemas/invoice.schema';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  async create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Invoice[]> {
    const startDateTime = startDate ? new Date(startDate) : undefined;
    const endDateTime = endDate ? new Date(endDate) : undefined;
    return this.invoicesService.findAll(startDateTime, endDateTime);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Invoice | null> {
    return this.invoicesService.findOne(id);
  }
} 
