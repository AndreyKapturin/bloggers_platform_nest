import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import type { TUserModel } from '../domain/user.entity';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from '../../../../services/CryptoService';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InputCreateUserDto } from '../dto/CreateUser.input-dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: TUserModel,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async createUser(inputCreateUserDto: InputCreateUserDto): Promise<string> {
    const { login, email, password } = inputCreateUserDto;

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

  async deleteUser(id: string): Promise<void> {
    const userDocument = await this.usersRepository.findById(id);

    if (!userDocument) {
      throw new NotFoundException(`User with id ${id} not exist`);
    }
    await this.usersRepository.delete(userDocument);
  }
}
