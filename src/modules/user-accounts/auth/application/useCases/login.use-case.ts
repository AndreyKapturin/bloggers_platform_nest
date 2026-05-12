import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  JwtAccessTokenSignPayload,
  JwtRefreshTokenSignPayload,
} from '../../types';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceSession,
  type TDeviceSessionModel,
} from '../../domain/DeviceSession.entity';
import { DeviceSessionsRepository } from '../../infrastructure/DeviceSessions.repository';
import { JwtTokensPair } from './types';
import { JwtTokensService } from '../JwtTokens.service';

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
    @InjectModel(DeviceSession.name)
    private DeviceSessionModel: TDeviceSessionModel,
    private deviceSessionRepository: DeviceSessionsRepository,
    private jwtTokensService: JwtTokensService,
  ) {}

  async execute(command: LoginCommand): Promise<JwtTokensPair> {
    const { userId, ip, deviceName } = command;
    const accessTokenPayload: JwtAccessTokenSignPayload = { userId };
    const refreshTokenPayload: JwtRefreshTokenSignPayload = {
      userId,
      deviceId: crypto.randomUUID(),
    };

    const tokensPair = await this.jwtTokensService.createTokensPair(
      accessTokenPayload,
      refreshTokenPayload,
    );

    const { iat, exp } = this.jwtTokensService.getTokenExpAndIatDates(
      tokensPair.refreshToken,
    );

    const deviceSession = this.DeviceSessionModel.makeInstance({
      userId: refreshTokenPayload.userId,
      deviceId: refreshTokenPayload.deviceId,
      deviceName,
      ip,
      tokenIat: iat,
      tokenExp: exp,
    });

    await this.deviceSessionRepository.save(deviceSession);
    return tokensPair;
  }
}
