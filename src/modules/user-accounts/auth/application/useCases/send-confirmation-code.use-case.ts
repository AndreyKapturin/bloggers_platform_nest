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
    const userDocument = await this.usersRepository.findByEmail(command.email);

    if (!userDocument) return;
    if (userDocument.emailConfirmation.isConfirmed) {
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

    const confirmationCode = crypto.randomUUID();
    const codeExpirationDate = DateUtils.getDatePlusHours(
      this.userAccountsConfig.confirmationCodeTtlHourse,
    );

    userDocument.setEmailConfirmationCode(confirmationCode, codeExpirationDate);

    await this.usersRepository.save(userDocument);

    this.emailService
      .sendConfirmationCode(userDocument.email, confirmationCode)
      .catch((error) => console.log('Send confirmation code error: ', error));
  }
}
