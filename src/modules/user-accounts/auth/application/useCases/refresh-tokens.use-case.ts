import { Command, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtTokensPair } from './types';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import {
  JwtAccessTokenSignPayload,
  JwtRefreshTokenSignPayload,
} from '../../types';
import { DeviceSessionsRepository } from '../../infrastructure/DeviceSessions.repository';
import { JwtTokensService } from '../JwtTokens.service';

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
    private jwtTokensService: JwtTokensService,
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

    const tokensPair = await this.jwtTokensService.createTokensPair(
      accessTokenPayload,
      refreshTokenPayload,
    );

    const { iat, exp } = this.jwtTokensService.getTokenExpAndIatDates(
      tokensPair.refreshToken,
    );

    deviceSession.updateTokenIatAndExp(iat, exp);

    await this.deviceSessionRepository.save(deviceSession);
    return tokensPair;
  }
}
