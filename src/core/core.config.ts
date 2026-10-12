import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsNumber } from 'class-validator';
import { BaseConfig } from './BaseConfig';

@Injectable()
export class CoreConfig extends BaseConfig {
  constructor(private configService: ConfigService) {
    super();

    this.port = Number(this.configService.get('PORT'));

    this.rateLimitTtlInMs = Number(
      this.configService.get('RATE_LIMIT_TTL_IN_MS'),
    );

    this.rateLimitRequestsCount = Number(
      this.configService.get('RATE_LIMIT_REQUESTS_COUNT'),
    );

    this.isIncludeTestingModule = this.convertToBoolean(
      this.configService.get('IS_INCLUDE_TESTING_MODULE') as string,
    ) as boolean;

    this.validate();
  }

  @IsNumber({}, { message: 'PORT must be a number. Example: 3000' })
  port: number;

  @IsNumber(
    { allowNaN: false },
    {
      message:
        'RATE_LIMIT_TTL_IN_MS must be a positive number. Example: 10_000',
    },
  )
  rateLimitTtlInMs: number;

  @IsNumber(
    { allowNaN: false },
    {
      message:
        'RATE_LIMIT_REQUESTS_COUNT must be a positive number. Example: 5',
    },
  )
  rateLimitRequestsCount: number;

  @IsBoolean({
    message: 'IS_INCLUDE_TESTING_MODULE must be boolean (true/false)',
  })
  isIncludeTestingModule: boolean;
}
