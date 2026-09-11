import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  JwtAccessTokenSignPayload,
  JwtRefreshTokenSignPayload,
} from '../../types';
import { JwtTokensPair } from './types';
import { JwtTokensService } from '../JwtTokens.service';
import { DeviceSessionsRepository } from '../../infrastructure/DeviceSessions.repository';
import { DeviceSession } from '../../domain/DeviceSession.entity';
import { User } from '../../../users/domain/user.entity';

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
    private deviceSessionRepository: DeviceSessionsRepository,
    private jwtTokensService: JwtTokensService,
  ) {}

  async execute(command: LoginCommand): Promise<JwtTokensPair> {
    const { userId, ip, deviceName } = command;
    const deviceId = crypto.randomUUID();
    const accessTokenPayload: JwtAccessTokenSignPayload = { userId };
    const refreshTokenPayload: JwtRefreshTokenSignPayload = {
      userId,
      deviceId,
    };

    const tokensPair = await this.jwtTokensService.createTokensPair(
      accessTokenPayload,
      refreshTokenPayload,
    );

    const { iat, exp } = this.jwtTokensService.getTokenExpAndIatDates(
      tokensPair.refreshToken,
    );

    const deviceSession = DeviceSession.create({
      deviceId,
      deviceName,
      ip,
      tokenExp: exp,
      tokenIat: iat,
      user: { id: userId } as User,
    });

    await this.deviceSessionRepository.save(deviceSession);
    return tokensPair;
  }
}
