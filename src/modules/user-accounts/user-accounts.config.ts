import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNotEmpty, IsNumber, Matches } from 'class-validator';
import type { StringValue } from 'ms';
import { BaseConfig } from '../../core/BaseConfig';

const timeRegExp =
  /^\d+(?:\s*(?:Years?|Yrs?|Y|Weeks?|W|Days?|D|Hours?|Hrs?|Hr?|H|Minutes?|Mins?|Min|M|Seconds?|Secs?|Sec|s|Milliseconds?|Millisecond|Msecs?|Msec|Ms))?$/i;

@Injectable()
export class UserAccountsConfig extends BaseConfig {
  constructor(private configService: ConfigService) {
    super();

    this.accessTokenSecret = this.configService.get(
      'ACCESS_TOKEN_SECRET',
    ) as string;

    this.refreshTokenSecret = this.configService.get(
      'REFRESH_TOKEN_SECRET',
    ) as string;

    this.accessTokenExpireIn = this.configService.get(
      'ACCESS_TOKEN_EXPIRE_IN',
    ) as StringValue;

    this.refreshTokenExpireIn = this.configService.get(
      'REFRESH_TOKEN_EXPIRE_IN',
    ) as StringValue;

    this.confirmationCodeTtlHourse = Number(
      this.configService.get('CONFIRMATION_CODE_TTL_HOURS'),
    );

    this.recoveryCodeTtlMinutes = Number(
      this.configService.get('RECOVERY_CODE_TTL_MINUTES'),
    );

    this.validate();
  }

  @IsNotEmpty({ message: 'ACCESS_TOKEN_SECRET is required' })
  accessTokenSecret: string;

  @IsNotEmpty({ message: 'REFRESH_TOKEN_SECRET is required' })
  refreshTokenSecret: string;

  @Matches(timeRegExp, {
    message: 'ACCESS_TOKEN_EXPIRE_IN is required. Example: "1h", "2d", "3m"',
  })
  accessTokenExpireIn: StringValue;

  @Matches(timeRegExp, {
    message: 'REFRESH_TOKEN_EXPIRE_IN is required. Example: "1h", "2d", "3m"',
  })
  refreshTokenExpireIn: StringValue;

  @IsNumber(
    { allowNaN: false },
    {
      message:
        'CONFIRMATION_CODE_TTL_DAYS must be a positive number. Example: 2',
    },
  )
  confirmationCodeTtlHourse: number;

  @IsNumber(
    { allowNaN: false },
    {
      message:
        'RECOVERY_CODE_TTL_MINUTES must be a positive number. Example: 5',
    },
  )
  recoveryCodeTtlMinutes: number;
}
