import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationCode(email: string, code: string): Promise<void> {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Email confirmation',
      html: this._createConfurmationCodeMailHTML(code),
    });
  }

  async sendRecoveryCode(email: string, code: string): Promise<void> {
    return await this.mailerService.sendMail({
      to: email,
      subject: 'Recovery password',
      html: this._createPasswordRecoveryCodeMailHTML(code),
    });
  }

  private _createConfurmationCodeMailHTML(confirmationCode: string) {
    return `<h1>Thank for your registration</h1>
      <p>To finish registration please follow the link below:
      <a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a>
    </p>`;
  }

  private _createPasswordRecoveryCodeMailHTML(recoveryCode: string) {
    return `<h1>Password recovery</h1>
       <p>To finish password recovery please follow the link below:
        <a href='https://somesite.com/password-recovery?recoveryCode=${recoveryCode}'>recovery password</a>
      </p>`;
  }
}
