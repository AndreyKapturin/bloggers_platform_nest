import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { User } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersEntityRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User | null> {
    return this.usersEntityRepository.findOneBy({ id });
  }

  async findByIdOrThrow(id: string): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `User with id ${id} not found`,
        [{ field: 'userId', message: `User with id ${id} not found` }],
      );
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersEntityRepository.findOne({
      where: { email },
    });
  }

  async findByEmailWithCode(email: string): Promise<User | null> {
    return this.usersEntityRepository.findOne({
      where: { email },
      relations: ['confirmationCode'],
    });
  }

  async findByEmailOrThrow(email: string): Promise<User> {
    const user = await this.findByEmail(email);

    if (!user) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `User with email ${email} not found`,
        [{ field: 'email', message: `User with email ${email} not found` }],
      );
    }

    return user;
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.usersEntityRepository.findOneBy({ login });
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<User | null> {
    return this.usersEntityRepository.findOneBy([
      { login: loginOrEmail },
      { email: loginOrEmail },
    ]);
  }

  async save(user: User): Promise<void> {
    await this.usersEntityRepository.save(user);
  }

  async findByConfirmationCode(confirmationCode: string): Promise<User | null> {
    return this.usersEntityRepository.findOne({
      where: { confirmationCode: { code: confirmationCode } },
      relations: { confirmationCode: true },
    });
  }

  async findByRecoveryCode(recoveryCode: string): Promise<User | null> {
    return this.usersEntityRepository.findOne({
      where: { passwordRecoveryCode: { code: recoveryCode } },
      relations: { passwordRecoveryCode: true },
    });
  }

  async delete(user: User): Promise<void> {
    await this.usersEntityRepository.remove(user);
  }
}
