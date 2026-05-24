import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { DomainCreateUserDto } from '../domain/dto/DomainCreateUser.dto';
import { TUserModel } from '../domain/user.entity';

@Injectable()
export class UsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: string): Promise<TUserModel | null> {
    const rows = await this.dataSource.query<TUserModel[]>(
      `SELECT * FROM "users" WHERE "id" = $1 LIMIT 1;`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByIdOrThrow(id: string): Promise<TUserModel> {
    const userDocument = await this.findById(id);

    if (!userDocument) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `User with id ${id} not found`,
        [{ field: 'userId', message: `User with id ${id} not found` }],
      );
    }

    return userDocument;
  }

  async findByEmail(email: string): Promise<TUserModel | null> {
    const rows = await this.dataSource.query<TUserModel[]>(
      `SELECT * FROM "users" WHERE "email" = $1 LIMIT 1;`,
      [email],
    );
    return rows[0] ?? null;
  }

  async findByEmailOrThrow(email: string): Promise<TUserModel> {
    const userDocument = await this.findByEmail(email);

    if (!userDocument) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `User with email ${email} not found`,
        [{ field: 'email', message: `User with email ${email} not found` }],
      );
    }

    return userDocument;
  }

  async findByLogin(login: string): Promise<TUserModel | null> {
    const rows = await this.dataSource.query<TUserModel[]>(
      `SELECT * FROM "users" WHERE "login" = $1 LIMIT 1;`,
      [login],
    );
    return rows[0] ?? null;
  }

  async findByLoginOrEmail(loginOrEmail: string): Promise<TUserModel | null> {
    const rows = await this.dataSource.query<TUserModel[]>(
      `SELECT * FROM "users" WHERE "login" = $1 OR "email" = $1 LIMIT 1;`,
      [loginOrEmail],
    );
    return rows[0] ?? null;
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

  async create(dto: DomainCreateUserDto): Promise<string> {
    const { login, email, passwordHash } = dto;
    const res = await this.dataSource.query(
      `INSERT INTO "users"
        ("login", "email", "passwordHash")
        VALUES ($1, $2, $3) RETURNING "id";`,
      [login, email, passwordHash],
    );
    return res[0].id;
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
