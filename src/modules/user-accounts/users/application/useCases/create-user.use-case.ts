import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import { UsersRepository } from '../../infrastructure/users.repository';
import { CryptoService } from '../../../../../services/CryptoService';
import { InjectModel } from '@nestjs/mongoose';
import { User, type TUserModel } from '../../domain/user.entity';

export class CreateUserCommand extends Command<string> {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {
    super();
  }
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  string
> {
  constructor(
    @InjectModel(User.name) private UserModel: TUserModel,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { login, email, password } = command;

    const isEmailBusy = await this.usersRepository.findByEmail(email);

    if (isEmailBusy) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User already exists',
        [
          {
            field: 'email',
            message: 'User with passed email already exists',
          },
        ],
      );
    }

    const isLoginBusy = await this.usersRepository.findByLogin(login);

    if (isLoginBusy) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User already exists',
        [
          {
            field: 'login',
            message: 'User with passed login already exists',
          },
        ],
      );
    }

    const passwordHash = await this.cryptoService.hash(password);

    const newUserDocument = this.UserModel.makeInstanse({
      login,
      email,
      passwordHash,
    });

    await this.usersRepository.save(newUserDocument);

    return newUserDocument.id;
  }
}
