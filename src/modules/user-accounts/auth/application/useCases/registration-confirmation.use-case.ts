import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import { UsersRepository } from '../../../users/infrastructure/users.repository';

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
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: RegistrationConfirmationCommand): Promise<void> {
    const userDocument = await this.usersRepository.findByConfirmationCode(
      command.confirmationCode,
    );

    if (!userDocument) {
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

    if (userDocument.emailConfirmation.isConfirmed) {
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

    userDocument.confirmEmail();
    await this.usersRepository.save(userDocument);
  }
}
