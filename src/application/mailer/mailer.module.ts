import { MailerModule as MailModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { EnvConfigService } from '../../config/env-config.service';
import { EnvConfigModule } from '../../config/env-config.module';

@Module({
  imports: [
    MailModule.forRootAsync({
      imports: [EnvConfigModule],
      useFactory: async (envConfigService: EnvConfigService) => {
        const { mailHost, mailPassword, mailPort, mailSender } =
          envConfigService.mailerConfig();

        return {
          transport: {
            host: mailHost,
            port: mailPort,
            secure: true,
            auth: {
              user: mailSender,
              pass: mailPassword,
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
        };
      },
      inject: [EnvConfigService],
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
