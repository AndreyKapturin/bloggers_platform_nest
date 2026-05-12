import { Inject, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CryptoService } from '../../../../services/CryptoService';
import { JwtService } from '@nestjs/jwt';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { HttpNewPasswordDto } from '../api/dto/HttpNewPassword.dto';
import {
  JwtAccessTokenSignPayload,
  JwtRefreshTokenDecodedPayload,
  JwtRefreshTokenSignPayload,
} from '../types';
import { JWT_AT_SERVICE, JWT_RT_SERVICE } from '../strategies/jwt/jwt-config';
import { DeviceSessionsRepository } from '../infrastructure/DeviceSessions.repository';

type JwtTokensPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    @Inject(JWT_AT_SERVICE)
    private jwtAccessTokenService: JwtService,
    @Inject(JWT_RT_SERVICE)
    private jwtRefreshTokenService: JwtService,
    private deviceSessionRepository: DeviceSessionsRepository,
  ) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<string | null> {
    const userDocument =
      await this.usersRepository.findByLoginOrEmail(loginOrEmail);

    if (!userDocument) return null;

    const isValidPassword = await this.cryptoService.compare(
      password,
      userDocument.passwordHash,
    );

    if (isValidPassword) return userDocument.id;

    return null;
  }

  async updatePassword(newPasswordDto: HttpNewPasswordDto): Promise<void> {
    const { recoveryCode, newPassword } = newPasswordDto;
    const userDocument =
      await this.usersRepository.findByRecoveryCode(recoveryCode);

    if (!userDocument) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User for the passed recovery code not found',
        [
          {
            field: 'recoveryCode',
            message: 'User for the passed recovery code not found',
          },
        ],
      );
    }

    const passwordHash = await this.cryptoService.hash(newPassword);

    userDocument.updatePasswordHash(passwordHash);
    userDocument.removeRecoveryCode();

    await this.usersRepository.save(userDocument);
  }

  async refreshTokens(
    deviceId: string,
    userId: string,
  ): Promise<JwtTokensPair> {
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

  async logout(deviceId: string, userId: string): Promise<void> {
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

    await this.deviceSessionRepository.delete(deviceSession);
  }
}
