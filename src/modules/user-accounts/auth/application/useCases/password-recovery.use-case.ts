import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtils } from '../../../../../utils/DateUtils';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserAccountsConfig } from '../../../user-accounts.config';
import { EmailService } from '../../../../notification/email.service';
import { RecoveryCodesRepository } from '../../../users/infrastructure/recovery-codes.repository';
import { PasswordRecoveryCode } from '../../../users/domain/password-recovery-code.entity';

export class PasswordRecoveryCommand extends Command<void> {
  constructor(public email: string) {
    super();
  }
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<
  PasswordRecoveryCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private recoveryCodesRepository: RecoveryCodesRepository,
    private userAccountsConfig: UserAccountsConfig,
    private emailService: EmailService,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const user = await this.usersRepository.findByEmail(command.email);
    if (!user) return;

    const code = crypto.randomUUID();
    const codeExpirationDate = DateUtils.getDatePlusMinutes(
      this.userAccountsConfig.recoveryCodeTtlMinutes,
    );

    const passwordRecoveryCode = PasswordRecoveryCode.create(code, codeExpirationDate, user);

    await this.recoveryCodesRepository.save(passwordRecoveryCode);

    this.emailService
      .sendRecoveryCode(user.email, code)
      .catch((error) => console.log('Send recovery code error: ', error));
  }
}
