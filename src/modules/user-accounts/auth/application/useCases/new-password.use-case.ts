import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import { UsersRepository } from '../../../users/infrastructure/users.repository';
import { CryptoService } from '../../../../../services/CryptoService';
import { RecoveryCodesRepository } from '../../../users/infrastructure/recovery-codes.repository';

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
    private recoveryCodesRepository: RecoveryCodesRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<void> {
    const { recoveryCode, newPassword } = command;
    const user =
      await this.usersRepository.findByRecoveryCode(recoveryCode);

    if (!user) {
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

    user.setNewPasswordHash(passwordHash);
    await this.recoveryCodesRepository.delete(user.passwordRecoveryCode!);
    user.deletePasswordRecoveryCode();
    await this.usersRepository.save(user);
  }
}
