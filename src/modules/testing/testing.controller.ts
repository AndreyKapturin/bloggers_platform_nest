import { Controller, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Controller('testing')
export class TestingController {
  constructor(
    @InjectConnection() private readonly databaseConnection: Connection,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAll() {
    const collections = await this.databaseConnection.listCollections();

    const promises = collections.map((collection) =>
      this.databaseConnection.collection(collection.name).deleteMany({}),
    );

    await this.dataSource.query(
      `
      TRUNCATE TABLE "emailConfirmationCodes", 
      "passwordRecoveryCodes",
      "deviceSessions",
      "users",
      "blogs",
      "posts" RESTART IDENTITY CASCADE;
    `,
    );

    await Promise.all(promises);

    return {
      status: 'succeeded',
    };
  }
}
