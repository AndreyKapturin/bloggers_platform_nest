import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export type TRecoveryCodeModel = {
  userId: string;
  code: string;
  codeExpirationDate: Date;
};

@Injectable()
export class RecoveryCodesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findByCode(code: string): Promise<TRecoveryCodeModel | null> {
    const rows = await this.dataSource.query<TRecoveryCodeModel[]>(
      `SELECT
        "prc"."userId",
        "prc"."code",
        "prc"."codeExpirationDate",
      FROM "passwordRecoveryCodes" "prc"
      WHERE "prc"."code" = $1
      LIMIT 1`,
      [code],
    );

    return rows[0] ?? null;
  }

  async create(
    userId: string,
    code: string,
    codeExpirationDate: Date,
  ): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO "passwordRecoveryCodes"
        ("userId", "code", "codeExpirationDate")
      VALUES ($1, $2, $3)`,
      [userId, code, codeExpirationDate],
    );
  }

  async delete(code: string): Promise<boolean> {
    const [_, deletedCount] = await this.dataSource.query(
      `DELETE FROM "passwordRecoveryCodes" WHERE "code" = $1;`,
      [code],
    );
    return deletedCount !== 0;
  }
}
