import { MailerService as MailService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  constructor(private mailService: MailService) {}

  async sendEmailConfirmation(email: string, verificationCode: string) {
    this.mailService
      .sendMail({
        to: email,
        subject: 'VMotor Account Verification',
        template: './confirmation',
        context: {
          verificationCode,
        },
      })
      .catch((error) => {
        this.logger.error('fail to send email', error);
      });
  }
}
