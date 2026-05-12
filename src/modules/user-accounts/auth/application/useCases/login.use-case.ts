import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  JwtAccessTokenSignPayload,
  JwtRefreshTokenSignPayload,
  JwtRefreshTokenDecodedPayload,
} from '../../types';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JWT_AT_SERVICE,
  JWT_RT_SERVICE,
} from '../../strategies/jwt/jwt-config';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceSession,
  type TDeviceSessionModel,
} from '../../domain/DeviceSession.entity';
import { DeviceSessionsRepository } from '../../infrastructure/DeviceSessions.repository';

type JwtTokensPair = {
  accessToken: string;
  refreshToken: string;
};

export class LoginCommand extends Command<JwtTokensPair> {
  constructor(
    public userId: string,
    public ip: string,
    public deviceName: string,
  ) {
    super();
  }
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<
  LoginCommand,
  JwtTokensPair
> {
  constructor(
    @Inject(JWT_AT_SERVICE)
    private jwtAccessTokenService: JwtService,
    @Inject(JWT_RT_SERVICE)
    private jwtRefreshTokenService: JwtService,
    @InjectModel(DeviceSession.name)
    private DeviceSessionModel: TDeviceSessionModel,
    private deviceSessionRepository: DeviceSessionsRepository,
  ) {}

  async execute(command: LoginCommand): Promise<JwtTokensPair> {
    const { userId, ip, deviceName } = command;
    const accessTokenPayload: JwtAccessTokenSignPayload = { userId };
    const refreshTokenPayload: JwtRefreshTokenSignPayload = {
      userId,
      deviceId: crypto.randomUUID(),
    };

    const accessToken =
      await this.jwtAccessTokenService.signAsync(accessTokenPayload);
    const refreshToken =
      await this.jwtRefreshTokenService.signAsync(refreshTokenPayload);

    const { exp, iat } =
      this.jwtRefreshTokenService.decode<JwtRefreshTokenDecodedPayload>(
        refreshToken,
      );

    const deviceSession = this.DeviceSessionModel.makeInstance({
      userId: refreshTokenPayload.userId,
      deviceId: refreshTokenPayload.deviceId,
      deviceName,
      ip,
      tokenIat: new Date(iat * 1000),
      tokenExp: new Date(exp * 1000),
    });

    await this.deviceSessionRepository.save(deviceSession);
    return { accessToken, refreshToken };
  }
}
