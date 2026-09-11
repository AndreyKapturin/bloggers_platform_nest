import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PasswordRecoveryCode } from '../domain/password-recovery-code.entity';

export type TRecoveryCodeModel = {
  userId: string;
  code: string;
  codeExpirationDate: Date;
};

@Injectable()
export class RecoveryCodesRepository {
  constructor(
    @InjectRepository(PasswordRecoveryCode)
    private readonly passwordRecoveryCodeEntityRepo: Repository<PasswordRecoveryCode>,
  ) {}

  async save(passwordRecoveryCode: PasswordRecoveryCode): Promise<void> {
    await this.passwordRecoveryCodeEntityRepo.save(passwordRecoveryCode);
  }

  async delete(passwordRecoveryCode: PasswordRecoveryCode): Promise<void> {
    await this.passwordRecoveryCodeEntityRepo.remove(passwordRecoveryCode);
  }
}
