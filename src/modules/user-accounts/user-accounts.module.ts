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
import {
  DeviceSession,
  DeviceSessionSchema,
} from './auth/domain/DeviceSession.entity';
import { DeviceSessionsRepository } from './auth/infrastructure/DeviceSessions.repository';
import { JwtRefreshStrategy } from './auth/strategies/jwt/JwtRefresh.strategy';
import { SecurityDevicesQueryRepository } from './security/infrastructure/SecurityDevices.query-repository';
import { SecurityDevicesController } from './security/api/security.controller';
import { GetSecurityDevicesQueryHandler } from './security/application/queries/get-security-devices.query';
import { DeleteSecurityDeviceUseCase } from './security/application/usecases/delete-security-device.command';
import { SecurityDevicesRepository } from './security/infrastructure/SecurityDevices.repository';
import { DeleteAllOtherSecurityDeviceUseCase } from './security/application/usecases/delete-all-other-security-devices.command';
import { CreateUserUseCase } from './users/application/useCases/create-user.use-case';
import { GetUserQueryHandler } from './users/application/queries/get-user.query';

const useCases = [
  CreateUserUseCase,
  DeleteSecurityDeviceUseCase,
  DeleteAllOtherSecurityDeviceUseCase,
]

const queryHandlers = [
  GetUserQueryHandler,
  GetSecurityDevicesQueryHandler,
]

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: DeviceSession.name, schema: DeviceSessionSchema },
    ]),
    PassportModule,
    JwtModule,
    NotificationModule,
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    UserAccountsConfig,
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    CryptoService,
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    SecurityDevicesRepository,
    SecurityDevicesQueryRepository,
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
    DeviceSessionsRepository,
    ...useCases,
    ...queryHandlers,
  ],
  exports: [UsersRepository],
})
export class UserAccountsModule {}
