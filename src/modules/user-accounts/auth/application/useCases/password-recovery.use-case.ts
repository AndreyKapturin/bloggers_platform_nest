import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DateUtils } from '../../../../../utils/DateUtils';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { UserAccountsConfig } from '../../../user-accounts.config';
import { EmailService } from '../../../../notification/email.service';

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
    private userAccountsConfig: UserAccountsConfig,
    private emailService: EmailService,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<void> {
    const userDocument = await this.usersRepository.findByEmail(command.email);
    if (!userDocument) return;

    const recoveryCode = crypto.randomUUID();
    const codeExpirationDate = DateUtils.getDatePlusMinutes(
      this.userAccountsConfig.recoveryCodeTtlMinutes,
    );

    userDocument.setRecoveryCode(recoveryCode, codeExpirationDate);

    await this.usersRepository.save(userDocument);

    this.emailService
      .sendRecoveryCode(userDocument.email, recoveryCode)
      .catch((error) => console.log('Send recovery code error: ', error));
  }
}
