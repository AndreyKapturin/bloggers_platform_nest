// TODO: install @nestjs-modules/mailer

import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
// import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    // MailerModule.forRoot({
    //   transport: 'smtps://user@domain.com:pass@smtp.domain.com',
    //   defaults: {
    //     from: '"nest-modules" <modules@nestjs.com>',
    //   },
    // }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationModule {}
