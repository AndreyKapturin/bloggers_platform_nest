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
  JWT_AT_SECRET,
  JWT_AT_SERVICE,
  JWT_AT_TTL,
  JWT_RT_SECRET,
  JWT_RT_SERVICE,
  JWT_RT_TTL,
} from './auth/strategies/jwt/jwt-config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule,
    NotificationModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    CryptoService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: JWT_AT_SERVICE,
      useFactory: () => {
        return new JwtService({
          secret: JWT_AT_SECRET,
          signOptions: { expiresIn: JWT_AT_TTL },
        });
      },
    },
    {
      provide: JWT_RT_SERVICE,
      useFactory: () => {
        return new JwtService({
          secret: JWT_RT_SECRET,
          signOptions: { expiresIn: JWT_RT_TTL },
        });
      },
    },
    BasicStrategy,
  ],
  exports: [UsersRepository],
})
export class UserAccountsModule {}
