import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtFromRequestFunction, Strategy } from 'passport-jwt';
import { UserWithDeviceInRequestDto } from '../../../../../core/dto/UserInRequest.dto';
import { JwtRefreshTokenDecodedPayload } from '../../types';
import { UserAccountsConfig } from '../../../user-accounts.config';
import { Request } from 'express';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import { DeviceSessionsRepository } from '../../infrastructure/DeviceSessions.repository';

const extractRefreshTokenFromCookie: JwtFromRequestFunction = (
  req: Request,
): string | null => {
  const refreshToken = req.cookies.refreshToken;
  return refreshToken ? refreshToken : null;
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    userAccountsConfig: UserAccountsConfig,
    private deviceSessionsRepository: DeviceSessionsRepository,
  ) {
    super({
      jwtFromRequest: extractRefreshTokenFromCookie,
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.refreshTokenSecret,
    });
  }

  async validate(
    payload: JwtRefreshTokenDecodedPayload,
  ): Promise<UserWithDeviceInRequestDto> {
    const deviceSession =
      await this.deviceSessionsRepository.findByDeviceIdAndUserId(
        payload.deviceId,
        payload.userId,
      );

    if (!deviceSession) {
      throw new DomainException(
        DomainExceptionStatus.InvalidCredentials,
        'Invalid refresh token',
        [
          {
            field: 'refreshToken',
            message: 'Refresh token is invalid',
          },
        ],
      );
    }

    const sessionTokenIatTimeshtamp = deviceSession.tokenIat.getTime();
    const payloadTokenIatTimeshtamp = new Date(payload.iat * 1000).getTime();
    
    if (sessionTokenIatTimeshtamp !== payloadTokenIatTimeshtamp) {
      throw new DomainException(
        DomainExceptionStatus.InvalidCredentials,
        'Invalid refresh token',
        [
          {
            field: 'refreshToken',
            message: 'Refresh token is revoked',
          },
        ],
      );
    }

    return { userId: payload.userId, deviceId: payload.deviceId };
  }
}
