import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth/api/auth.controller';
import { User, UserSchema } from './users/domain/user.entity';
import { UsersController } from './users/api/users.controller';
import { UsersService } from './users/application/users.service';
import { UsersRepository } from './users/infrastructure/users.repository';
import { UsersQueryRepository } from './users/infrastructure/users.query-repository';
import { CryptoService } from '../../services/CryptoService';
import { AuthService } from './auth/application/auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './auth/strategies/local/Local.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';
import { JwtStrategy } from './auth/strategies/jwt/Jwt.strategy';
import { BasicStrategy } from './auth/strategies/basic/Basic.strategy';
import {
  JWT_AT_SERVICE,
  JWT_RT_SERVICE,
} from './auth/strategies/jwt/jwt-config';
import { UserAccountsConfig } from './user-accounts.config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule,
    NotificationModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UserAccountsConfig,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    CryptoService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: JWT_AT_SERVICE,
      useFactory: (userAccountsConfig: UserAccountsConfig) => {
        return new JwtService({
          secret: userAccountsConfig.accessTokenSecret,
          signOptions: { expiresIn: userAccountsConfig.accessTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
    {
      provide: JWT_RT_SERVICE,
      useFactory: (userAccountsConfig: UserAccountsConfig) => {
        return new JwtService({
          secret: userAccountsConfig.refreshTokenSecret,
          signOptions: { expiresIn: userAccountsConfig.refreshTokenExpireIn },
        });
      },
      inject: [UserAccountsConfig],
    },
    BasicStrategy,
  ],
  exports: [UsersRepository],
})
export class UserAccountsModule {}
