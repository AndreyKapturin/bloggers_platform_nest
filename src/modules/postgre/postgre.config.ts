import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseConfig } from '../../core/BaseConfig';
import { IsNotEmpty, IsNumber } from 'class-validator';

@Injectable()
export class PgConfig extends BaseConfig {
  constructor(configService: ConfigService) {
    super();

    this.host = configService.get('PG_HOST') as string;
    this.port = Number(configService.get('PG_PORT')) as number;
    this.database = configService.get('PG_DATABASE') as string;
    this.user = configService.get('PG_USER') as string;
    this.password = configService.get('PG_PASSWORD') as string;

    this.validate();
  }

  @IsNotEmpty({
    message: 'PG_HOST is required. You can use "localhost" for development',
  })
  host: string;

  @IsNumber({}, { message: 'PG_PORT must be a number. Example: 5432' })
  port: number;

  @IsNotEmpty({
    message: 'PG_DATABASE is required. Use your database name',
  })
  database: string;

  @IsNotEmpty({
    message: 'PG_USER is required',
  })
  user: string;

  @IsNotEmpty({
    message: 'PG_PASSWORD is required',
  })
  password: string;
}
