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
import { JwtAccessTokenPayload, JwtRegreshTokenPayload } from '../types';
import { JWT_AT_SERVICE, JWT_RT_SERVICE } from '../strategies/jwt/jwt-config';
import { UserAccountsConfig } from '../../user-accounts.config';

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

  async login(
    userId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessTokenPayload: JwtAccessTokenPayload = { userId };
    const refreshTokenPayload: JwtRegreshTokenPayload = {
      userId,
      deviceId: crypto.randomUUID(),
    };
    const accessToken =
      await this.jwtAccessTokenService.signAsync(accessTokenPayload);
    const refreshToken =
      await this.jwtRefreshTokenService.signAsync(refreshTokenPayload);
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
