import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JWT_AT_SERVICE, JWT_RT_SERVICE } from '../strategies/jwt/jwt-config';
import { JwtTokensPair } from './useCases/types';
import {
  JwtAccessTokenSignPayload,
  JwtRefreshTokenDecodedPayload,
  JwtRefreshTokenSignPayload,
} from '../types';

@Injectable()
export class JwtTokensService {
  constructor(
    @Inject(JWT_AT_SERVICE)
    private jwtAccessTokenService: JwtService,
    @Inject(JWT_RT_SERVICE)
    private jwtRefreshTokenService: JwtService,
  ) {}

  async createTokensPair(
    accessTokenPayload: JwtAccessTokenSignPayload,
    refreshTokenPayload: JwtRefreshTokenSignPayload,
  ): Promise<JwtTokensPair> {
    const accessToken =
      await this.jwtAccessTokenService.signAsync(accessTokenPayload);
    const refreshToken =
      await this.jwtRefreshTokenService.signAsync(refreshTokenPayload);

    return { accessToken, refreshToken };
  }

  getTokenExpAndIatDates(refreshToken: string): { exp: Date; iat: Date } {
    const { exp, iat } =
      this.jwtRefreshTokenService.decode<JwtRefreshTokenDecodedPayload>(
        refreshToken,
      );

    return {
      iat: new Date(iat * 1000),
      exp: new Date(exp * 1000),
    };
  }
}
