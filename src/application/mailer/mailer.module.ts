import { MailerModule as MailModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';

@Module({
  imports: [
    MailModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'prime.subscription.notifications@gmail.com',
          pass: 'cqpejuqebdjegrvc',
        },
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: './src/application/mailer/templates',
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
