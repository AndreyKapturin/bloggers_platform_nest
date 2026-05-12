import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CryptoService } from '../../../../../services/CryptoService';

export class NewPasswordCommand extends Command<void> {
  constructor(
    public recoveryCode: string,
    public newPassword: string,
  ) {
    super();
  }
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase implements ICommandHandler<
  NewPasswordCommand,
  void
> {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<void> {
    const { recoveryCode, newPassword } = command;
    const userDocument =
      await this.usersRepository.findByRecoveryCode(recoveryCode);

    if (!userDocument) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User for the passed recovery code not found',
        [
          {
            field: 'recoveryCode',
            message: 'User for the passed recovery code not found',
          },
        ],
      );
    }

    const passwordHash = await this.cryptoService.hash(newPassword);

    userDocument.updatePasswordHash(passwordHash);
    userDocument.removeRecoveryCode();

    await this.usersRepository.save(userDocument);
  }
}
