import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

// Mock the nodemailer module
const mockSendMailFn = jest.fn().mockResolvedValue({ messageId: 'test-message-id' });

jest.mock('nodemailer', () => {
  return {
    createTestAccount: jest.fn().mockResolvedValue({
      user: 'test@example.com',
      pass: 'testpassword',
    }),
    createTransport: jest.fn(() => ({
      sendMail: mockSendMailFn,
    })),
    getTestMessageUrl: jest.fn().mockReturnValue('http://test-message-url'),
  };
});

describe('EmailService', () => {
  let service: EmailService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'EMAIL_FROM') return 'test@example.com';
      return null;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendEmail', () => {
    it('should send email successfully', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const text = 'Test Text';
      const html = '<p>Test HTML</p>';

      const result = await service.sendEmail(to, subject, text, html);

      expect(result).toBe(true);
      expect(mockSendMailFn).toHaveBeenCalledWith({
        from: 'test@example.com',
        to,
        subject,
        text,
        html,
      });
    });

    it('should use text as html if html is not provided', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const text = 'Test Text';

      const result = await service.sendEmail(to, subject, text);

      expect(result).toBe(true);
      expect(mockSendMailFn).toHaveBeenCalledWith({
        from: 'test@example.com',
        to,
        subject,
        text,
        html: text,
      });
    });

    it('should return false if email sending fails', async () => {
      const to = 'recipient@example.com';
      const subject = 'Test Subject';
      const text = 'Test Text';

      mockSendMailFn.mockRejectedValueOnce(new Error('Send mail error'));

      const result = await service.sendEmail(to, subject, text);

      expect(result).toBe(false);
    });
  });
}); 
