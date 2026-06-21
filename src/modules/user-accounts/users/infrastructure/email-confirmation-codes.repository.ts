import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export type TEmailConfirmationCodeModel = {
  userId: string;
  code: string;
  codeExpirationDate: Date;
};

@Injectable()
export class EmailConfirmationCodesRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findByCode(code: string): Promise<TEmailConfirmationCodeModel | null> {
    const rows = await this.dataSource.query<TEmailConfirmationCodeModel[]>(
      `SELECT
        "ecc"."userId",
        "ecc"."code",
        "ecc"."emailConfirmationCodes",
      FROM "emailConfirmationCodes" "ecc"
      WHERE "ecc"."code" = $1
      LIMIT 1`,
      [code],
    );

    return rows[0] ?? null;
  }

  async saveOrUpdate(
    userId: string,
    code: string,
    codeExpirationDate: Date,
  ): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO "emailConfirmationCodes"
        ("userId", "code", "codeExpirationDate")
      VALUES
        ($1, $2, $3)
      ON CONFLICT ("userId") DO UPDATE
      SET
	      "code" = "excluded"."code",
	      "codeExpirationDate" = "excluded"."codeExpirationDate"`,
      [userId, code, codeExpirationDate],
    );
  }

  async delete(code: string): Promise<boolean> {
    const [_, deletedCount] = await this.dataSource.query(
      `DELETE FROM "emailConfirmationCodes" WHERE "code" = $1;`,
      [code],
    );
    return deletedCount !== 0;
  }
}
