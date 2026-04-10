import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.entity';
import type { TUserModel } from '../domain/user.entity';
import { InputCreateUserDto } from '../dto/User.input-create-dto';
import { UsersRepository } from '../infrastructure/users.repository';
import { CryptoService } from '../../../../services/CryptoService';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private UserModel: TUserModel,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
  ) {}

  async createUser(inputCreateUserDto: InputCreateUserDto): Promise<string> {
    const { login, email, password } = inputCreateUserDto;

    const passwordHash = await this.cryptoService.hash(password);

    const user = this.UserModel.makeConfirmedInstanse({
      email,
      login,
      passwordHash,
    });

    await this.usersRepository.save(user);
    return user.id;
  }

  async deleteUser(id: string): Promise<void> {
    const userDocument = await this.usersRepository.findById(id);

    if (!userDocument) {
      throw new NotFoundException(`User with id ${id} not exist`);
    }
    await this.usersRepository.delete(userDocument);
  }
}
