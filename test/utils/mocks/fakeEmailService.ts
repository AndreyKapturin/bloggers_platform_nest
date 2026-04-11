import { EmailService } from '../../../src/modules/notification/email.service';

export const fakeEmailService: EmailService = {
  async sendConfirmationCode(email: string, code: string): Promise<void> {},
  async sendRecoveryCode(email: string, code: string): Promise<void> {},
};
