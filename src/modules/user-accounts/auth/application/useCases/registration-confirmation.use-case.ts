import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { EmailConfirmationCodesRepository } from '../../../users/infrastructure/email-confirmation-codes.repository';

export class RegistrationConfirmationCommand extends Command<void> {
  constructor(public confirmationCode: string) {
    super();
  }
}

@CommandHandler(RegistrationConfirmationCommand)
export class RegistrationConfirmationUseCase implements ICommandHandler<
  RegistrationConfirmationCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private emailConfirmationCodesRepository: EmailConfirmationCodesRepository,
  ) {}

  async execute(command: RegistrationConfirmationCommand): Promise<void> {
    const user = await this.usersRepository.findByConfirmationCode(
      command.confirmationCode,
    );

    if (!user) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User with passed confirmation code not found',
        [
          {
            field: 'code',
            message: 'User with passed confirmation code not found',
          },
        ],
      );
    }

    if (user.isConfirmed) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User already confirmed',
        [
          {
            field: 'code',
            message: 'User already confirmed',
          },
        ],
      );
    }

    await this.usersRepository.updateConfirmationStatus(user.id, true);
    await this.emailConfirmationCodesRepository.delete(command.confirmationCode);
  }
}
