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
import { JwtModule } from '@nestjs/jwt';
import { NotificationModule } from '../notification/notification.module';
import { JwtStrategy } from './auth/strategies/jwt/Jwt.strategy';
import { BasicStrategy } from './auth/strategies/basic/Basic.strategy';

// TODO: to env
const JWT_AT_SECRET = 'c785q4nct98';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule,
    JwtModule.register({
      secret: JWT_AT_SECRET,
      signOptions: { expiresIn: '5m' },
    }),
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
    BasicStrategy,
  ],
  exports: [UsersRepository],
})
export class UserAccountsModule {}
