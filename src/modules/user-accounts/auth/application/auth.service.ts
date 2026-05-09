import { Inject, Injectable } from '@nestjs/common';
import { HttpCreateUserDto } from '../../users/api/dto/HttpCreateUser.dto';
import { TUserDocument } from '../../users/domain/user.entity';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CryptoService } from '../../../../services/CryptoService';
import { DateUtils } from '../../../../utils/DateUtils';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../../notification/email.service';
import { UsersService } from '../../users/application/users.service';
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
import { UserAccountsConfig } from '../../user-accounts.config';
import { InjectModel } from '@nestjs/mongoose';
import {
  DeviceSession,
  type TDeviceSessionModel,
} from '../domain/DeviceSession.entity';
import { LoginDto } from './dto/Login.dto';
import { DeviceSessionsRepository } from '../infrastructure/DeviceSessions.repository';

type JwtTokensPair = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private usersService: UsersService,
    private cryptoService: CryptoService,
    @Inject(JWT_AT_SERVICE)
    private jwtAccessTokenService: JwtService,
    @Inject(JWT_RT_SERVICE)
    private jwtRefreshTokenService: JwtService,
    private emailService: EmailService,
    private userAuthConfig: UserAccountsConfig,
    @InjectModel(DeviceSession.name)
    private DeviceSessionModel: TDeviceSessionModel,
    private deviceSessionRepository: DeviceSessionsRepository,
  ) {}

  async registration(dto: HttpCreateUserDto): Promise<void> {
    const userId = await this.usersService.createUser(dto);
    const userDocument = await this.usersRepository.findById(userId);
    this._setConfirmationCode(userDocument!);
    await this.usersRepository.save(userDocument!);
  }

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

  async login(dto: LoginDto): Promise<JwtTokensPair> {
    const { userId, ip, deviceName } = dto;
    const accessTokenPayload: JwtAccessTokenSignPayload = { userId };
    const refreshTokenPayload: JwtRefreshTokenSignPayload = {
      userId,
      deviceId: crypto.randomUUID(),
    };
    const accessToken =
      await this.jwtAccessTokenService.signAsync(accessTokenPayload);
    const refreshToken =
      await this.jwtRefreshTokenService.signAsync(refreshTokenPayload);

    const decodedRefreshTokenPayload =
      this.jwtAccessTokenService.decode<JwtRefreshTokenDecodedPayload>(
        refreshToken,
      );

    const tokenExpAt = new Date(decodedRefreshTokenPayload.exp * 1000);

    const deviceSession = this.DeviceSessionModel.makeInstance({
      userId: decodedRefreshTokenPayload.userId,
      deviceId: decodedRefreshTokenPayload.deviceId,
      deviceName,
      ip,
      tokenExpAt,
    });

    await this.deviceSessionRepository.save(deviceSession);
    return { accessToken, refreshToken };
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    const userDocument = await this.usersRepository.findByEmail(email);

    if (!userDocument) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User with passed email not found',
        [
          {
            field: 'email',
            message: 'User with passed email not found',
          },
        ],
      );
    }

    if (userDocument.emailConfirmation.isConfirmed) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'Email already confirmed',
        [
          {
            field: 'email',
            message: 'Email already confirmed',
          },
        ],
      );
    }

    this._setConfirmationCode(userDocument);

    await this.usersRepository.save(userDocument);
  }

  async confirmRegistration(confirmationCode: string): Promise<void> {
    const userDocument =
      await this.usersRepository.findByConfirmationCode(confirmationCode);

    if (!userDocument) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User with passed confirmation code not found',
        [
          {
            field: 'code',
            message: 'User with passed confirmation code not found',
          },
        ],
      );
    }

    if (userDocument.emailConfirmation.isConfirmed) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User already confirmed',
        [
          {
            field: 'code',
            message: 'User already confirmed',
          },
        ],
      );
    }

    userDocument.confirmEmail();
    await this.usersRepository.save(userDocument);
  }

  async recoveryPassword(email: string): Promise<void> {
    const userDocument = await this.usersRepository.findByEmail(email);

    if (!userDocument) return;

    const recoveryCode = crypto.randomUUID();
    const codeExpirationDate = DateUtils.getDatePlusMinutes(
      this.userAuthConfig.recoveryCodeTtlMinutes,
    );

    userDocument.setRecoveryCode(recoveryCode, codeExpirationDate);

    await this.usersRepository.save(userDocument);

    this.emailService
      .sendRecoveryCode(userDocument.email, recoveryCode)
      .catch((error) => console.log('Send recovery code error: ', error));
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

    const decodedRefreshTokenPayload =
      this.jwtAccessTokenService.decode<JwtRefreshTokenDecodedPayload>(
        refreshToken,
      );

    const tokenExpAt = new Date(decodedRefreshTokenPayload.exp * 1000);

    deviceSession.updateTokenExpAt(tokenExpAt);

    await this.deviceSessionRepository.save(deviceSession);
    return { accessToken, refreshToken };
  }

  private _setConfirmationCode(userDocument: TUserDocument) {
    const confirmationCode = crypto.randomUUID();
    const codeExpirationDate = DateUtils.getDatePlusDays(
      this.userAuthConfig.confirmationCodeTtlHourse,
    );

    userDocument.setEmailConfirmationCode(confirmationCode, codeExpirationDate);

    this.emailService
      .sendConfirmationCode(userDocument.email, confirmationCode)
      .catch((error) => console.log('Send confirmation code error: ', error));
  }
}
