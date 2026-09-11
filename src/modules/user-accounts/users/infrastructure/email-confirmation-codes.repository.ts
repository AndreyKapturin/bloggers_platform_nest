import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailConfirmationCode } from '../domain/email-confirmation-code.entity';

@Injectable()
export class EmailConfirmationCodesRepository {
  constructor(
    @InjectRepository(EmailConfirmationCode)
    private readonly emailConfirmationCodeEntityRepo: Repository<EmailConfirmationCode>,
  ) {}

  async delete(code: EmailConfirmationCode): Promise<void> {
    await this.emailConfirmationCodeEntityRepo.remove(code);
  }
}
