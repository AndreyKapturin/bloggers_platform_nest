import { JwtService } from '@nestjs/jwt';
import { TestingModuleBuilder } from '@nestjs/testing';
import { JWT_RT_SERVICE } from '../../src/modules/user-accounts/auth/strategies/jwt/jwt-config';
import { UserAccountsConfig } from '../../src/modules/user-accounts/user-accounts.config';

export const overrideRefreshTokenJwtService = (
  builder: TestingModuleBuilder,
) => {
  builder.overrideProvider(JWT_RT_SERVICE).useFactory({
    factory: (userAccountsConfig: UserAccountsConfig) => {
      return new JwtService({
        secret: userAccountsConfig.refreshTokenSecret,
        signOptions: { expiresIn: '5s' },
      });
    },
    inject: [UserAccountsConfig],
  });
};
