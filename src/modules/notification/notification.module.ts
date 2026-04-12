import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';

const MAIL_USERNAME = 'andrei.kapturin';
const MAIL_EMAIL = 'andrei.kapturin@yandex.ru';
const MAIL_PASSWORD = 'bzdpxrwgduazkgkg';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        service: 'Yandex',
        auth: {
          user: MAIL_USERNAME,
          pass: MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"Bloggers platform" <${MAIL_EMAIL}>`,
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationModule {}
