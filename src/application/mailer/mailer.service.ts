import { MailerService as MailService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { SendEmailDto } from './dtos/send-email.dto';
import { encrypt } from '../../shared/utils/crypto.utils';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  constructor(private mailService: MailService) {}

  async sendEmailConfirmation({ email, userId, host }: SendEmailDto) {
    const confirmationUrl = `${host}/user/${encrypt(userId)}/verify`;

    this.mailService
      .sendMail({
        to: email,
        subject: 'Welcome to V-Motor App! Confirm your Email',
        template: './confirmation',
        context: {
          name: 'victor',
          url: confirmationUrl,
        },
      })
      .catch((error) => {
        this.logger.error('fail to send email', error);
      });
  }
}
