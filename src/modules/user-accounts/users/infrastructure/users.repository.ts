import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { TUserModel, User } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly usersEntityRepository: Repository<User>,
    @InjectDataSource() private dataSource: DataSource,
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
    return this.usersEntityRepository.findOneBy({ email });
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

  async findByConfirmationCode(
    confirmationCode: string,
  ): Promise<TUserModel | null> {
    const rows = await this.dataSource.query<TUserModel[]>(
      `SELECT "u".*
        FROM
	        "emailConfirmationCodes" "ecc"
	      LEFT JOIN
          "users" "u" ON "u"."id" = "ecc"."userId"
        WHERE
	        "ecc"."code" = $1
        LIMIT 1;`,
      [confirmationCode],
    );
    return rows[0] ?? null;
  }

  async findByRecoveryCode(recoveryCode: string): Promise<TUserModel | null> {
    const rows = await this.dataSource.query<TUserModel[]>(
      `SELECT "u".*
        FROM
	        "passwordRecoveryCodes" "prc"
	      LEFT JOIN
          "users" "u" ON "u"."id" = "prc"."userId"
        WHERE
	        "prc"."code" = $1
        LIMIT 1;`,
      [recoveryCode],
    );
    return rows[0] ?? null;
  }

  async updatePasswordHash(
    userId: string,
    newPasswordHash: string,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "users" SET "passwordHash" = $1 WHERE "id" = $2`,
      [newPasswordHash, userId],
    );
  }

  async updateConfirmationStatus(
    userId: string,
    status: boolean,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "users" SET "isConfirmed" = $1 WHERE "id" = $2`,
      [status, userId],
    );
  }

  async delete(id: string): Promise<boolean> {
    const [_, deletedCount] = await this.dataSource.query(
      `DELETE FROM "users" WHERE "id" = $1;`,
      [id],
    );
    return deletedCount !== 0;
  }
}
