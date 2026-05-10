import { JwtService } from '@nestjs/jwt';
import { TestingModuleBuilder } from '@nestjs/testing';
import { JWT_AT_SERVICE } from '../../src/modules/user-accounts/auth/strategies/jwt/jwt-config';
import { UserAccountsConfig } from '../../src/modules/user-accounts/user-accounts.config';

export const overrideAccessTokenJwtService = (
  builder: TestingModuleBuilder,
) => {
  builder.overrideProvider(JWT_AT_SERVICE).useFactory({
    factory: (userAccountsConfig: UserAccountsConfig) => {
      return new JwtService({
        secret: userAccountsConfig.accessTokenSecret,
        signOptions: { expiresIn: '2s' },
      });
    },
    inject: [UserAccountsConfig],
  });
};
