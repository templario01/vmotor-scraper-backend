import { MailerService as MailService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { SendEmailDto } from './dtos/send-email.dto';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  constructor(private mailService: MailService) {}

  async sendEmailConfirmation({ email, userUUID, host }: SendEmailDto) {
    const confirmationUrl = `${host}/user/validate/${userUUID}`;

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
