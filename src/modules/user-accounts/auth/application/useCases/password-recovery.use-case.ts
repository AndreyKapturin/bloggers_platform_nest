import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtils } from '../../../../../utils/DateUtils';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserAccountsConfig } from '../../../user-accounts.config';
import { EmailService } from '../../../../notification/email.service';
import { RecoveryCodesRepository } from '../../../users/infrastructure/recovery-codes.repository';

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

    const recoveryCode = crypto.randomUUID();
    const codeExpirationDate = DateUtils.getDatePlusMinutes(
      this.userAccountsConfig.recoveryCodeTtlMinutes,
    );

    await this.recoveryCodesRepository.create(
      user.id,
      recoveryCode,
      codeExpirationDate,
    );

    this.emailService
      .sendRecoveryCode(user.email, recoveryCode)
      .catch((error) => console.log('Send recovery code error: ', error));
  }
}
