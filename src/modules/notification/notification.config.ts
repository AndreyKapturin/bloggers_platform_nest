import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseConfig } from '../../core/BaseConfig';
import { IsEmail, IsNotEmpty } from 'class-validator';

@Injectable()
export class NotificationConfig extends BaseConfig {
  constructor(configService: ConfigService) {
    super();
    this.mailServiceId = configService.get('MAIL_SERVICE_ID') as string;
    this.mailUsername = configService.get('MAIL_USERNAME') as string;
    this.mailSenderEmail = configService.get('MAIL_SENDER_EMAIL') as string;
    this.mailPassword = configService.get('MAIL_PASSWORD') as string;

    this.validate();
  }

  @IsNotEmpty({
    message:
      'MAIL_SERVICE_ID is required. You can choose for yourself in the documentation: https://nodemailer.com/smtp/well-known-services#list-of-built-in-services',
  })
  mailServiceId: string;

  @IsNotEmpty({ message: 'MAIL_USERNAME is required' })
  mailUsername: string;

  @IsEmail(
    {},
    {
      message: 'MAIL_SENDER_EMAIL is required. Should be a valid email address',
    },
  )
  mailSenderEmail: string;

  @IsNotEmpty({ message: 'MAIL_PASSWORD is required' })
  mailPassword: string;
}
