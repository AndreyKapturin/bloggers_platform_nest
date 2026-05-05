import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationConfig } from './notification.config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [NotificationModule],
      inject: [NotificationConfig],
      useFactory: (notificationConfig: NotificationConfig) => {
        return {
          transport: {
            service: notificationConfig.mailServiceId,
            auth: {
              user: notificationConfig.mailUsername,
              pass: notificationConfig.mailPassword,
            },
          },
          defaults: {
            from: `"Bloggers platform" <${notificationConfig.mailSenderEmail}>`,
          },
        };
      },
    }),
  ],
  providers: [EmailService, NotificationConfig],
  exports: [EmailService, NotificationConfig],
})
export class NotificationModule {}
