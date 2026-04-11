// TODO: install @nestjs-modules/mailer

// import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  // constructor(private mailerService: MailerService) {}

  async sendConfirmationCode(email: string, code: string): Promise<void> {
    //can add html templates, implement advertising and other logic for mailing...
    // await this.mailerService.sendMail({
    //   text: `confirm registration via link https://some.com?code=${code}`,
    // });
  }

  async sendRecoveryCode(email: string, code: string): Promise<void> {}
}