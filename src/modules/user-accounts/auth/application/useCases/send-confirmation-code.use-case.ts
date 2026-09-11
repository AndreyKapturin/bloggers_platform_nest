import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { DateUtils } from '../../../../../utils/DateUtils';
import { UserAccountsConfig } from '../../../user-accounts.config';
import { EmailService } from '../../../../notification/email.service';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';

export class SendConfirmationCodeCommand extends Command<void> {
  constructor(public email: string) {
    super();
  }
}

@CommandHandler(SendConfirmationCodeCommand)
export class SendConfirmationCodeUseCase implements ICommandHandler<
  SendConfirmationCodeCommand,
  void
> {
  constructor(
    private userAccountsConfig: UserAccountsConfig,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: SendConfirmationCodeCommand): Promise<void> {
    const user = await this.usersRepository.findByEmailWithCode(command.email);

    if (!user) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User with passed email not exist',
        [
          {
            field: 'email',
            message: 'User with passed email not exist',
          },
        ],
      );
    }

    if (user.isConfirmed) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'Email already confirmed',
        [
          {
            field: 'email',
            message: 'Email already confirmed',
          },
        ],
      );
    }

    const code = crypto.randomUUID();
    const codeExpirationDate = DateUtils.getDatePlusHours(
      this.userAccountsConfig.confirmationCodeTtlHourse,
    );

    user.setConfirmationCode(code, codeExpirationDate);

    await this.usersRepository.save(user);

    this.emailService
      .sendConfirmationCode(user.email, code)
      .catch((error) => console.log('Send confirmation code error: ', error));
  }
}
