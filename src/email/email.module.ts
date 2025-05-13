import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailConsumer } from './email.consumer';

@Module({
  imports: [ConfigModule],
  providers: [EmailService, EmailConsumer],
  exports: [EmailService],
})
export class EmailModule {} 