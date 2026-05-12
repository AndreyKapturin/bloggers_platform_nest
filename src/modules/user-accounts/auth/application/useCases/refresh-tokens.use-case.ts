import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtTokensPair } from './types';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import {
  JwtAccessTokenSignPayload,
  JwtRefreshTokenSignPayload,
  JwtRefreshTokenDecodedPayload,
} from '../../types';
import { DeviceSessionsRepository } from '../../infrastructure/DeviceSessions.repository';
import { Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  JWT_AT_SERVICE,
  JWT_RT_SERVICE,
} from '../../strategies/jwt/jwt-config';

export class RefreshTokensCommand extends Command<JwtTokensPair> {
  constructor(
    public deviceId: string,
    public userId: string,
  ) {
    super();
  }
}

@CommandHandler(RefreshTokensCommand)
export class RefreshTokensUseCase implements ICommandHandler<
  RefreshTokensCommand,
  JwtTokensPair
> {
  constructor(
    private deviceSessionRepository: DeviceSessionsRepository,
    @Inject(JWT_AT_SERVICE)
    private jwtAccessTokenService: JwtService,
    @Inject(JWT_RT_SERVICE)
    private jwtRefreshTokenService: JwtService,
  ) {}

  async execute(command: RefreshTokensCommand): Promise<JwtTokensPair> {
    const { deviceId, userId } = command;

    const deviceSession =
      await this.deviceSessionRepository.findByDeviceIdAndUserId(
        deviceId,
        userId,
      );

    if (!deviceSession) {
      throw new DomainException(
        DomainExceptionStatus.InvalidCredentials,
        'Invalid refresh token',
        [
          {
            field: 'refreshToken',
            message: 'Invalid refresh token',
          },
        ],
      );
    }

    const accessTokenPayload: JwtAccessTokenSignPayload = { userId };
    const refreshTokenPayload: JwtRefreshTokenSignPayload = {
      userId,
      deviceId,
    };

    const accessToken =
      await this.jwtAccessTokenService.signAsync(accessTokenPayload);
    const refreshToken =
      await this.jwtRefreshTokenService.signAsync(refreshTokenPayload);

    const { exp, iat } =
      this.jwtRefreshTokenService.decode<JwtRefreshTokenDecodedPayload>(
        refreshToken,
      );

    deviceSession.updateTokenIatAndExp(
      new Date(iat * 1000),
      new Date(exp * 1000),
    );

    await this.deviceSessionRepository.save(deviceSession);
    return { accessToken, refreshToken };
  }
}
