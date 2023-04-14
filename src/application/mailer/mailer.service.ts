import { MailerService as MailService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerService {
  constructor(private mailerService: MailService) {}

  async sendEmailConfirmation(email: string) {
    const url = `example.com/auth/confirm?token=${'121243'}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Nice App! Confirm your Email',
      template: './confirmation',
      context: {
        name: 'victor',
        url,
      },
    });
  }
}
