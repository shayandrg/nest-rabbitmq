import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.initializeTransporter();
  }

  private async initializeTransporter() {
    // For development/testing, create a test account in Ethereal
    const testAccount = await nodemailer.createTestAccount();
    
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // example for custom email service

    // this.transporter = nodemailer.createTransport({
    //   host: this.configService.get<string>('EMAIL_HOST'),
    //   port: this.configService.get<number>('EMAIL_PORT'),
    //   secure: this.configService.get<boolean>('EMAIL_SECURE'),
    //   auth: {
    //     user: this.configService.get<string>('EMAIL_USER'),
    //     pass: this.configService.get<string>('EMAIL_PASSWORD'),
    //   },
    // });
    
    this.logger.log(`Test email account generated: ${testAccount.user}`);
  }

  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM') || '"Invoice" <system@example.com>',
        to,
        subject,
        text,
        html: html || text,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
      this.logger.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);

      return true;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`, error.stack);
      return false;
    }
  }
}
