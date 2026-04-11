import { Injectable } from '@nestjs/common';
import { InputCreateUserDto } from '../../users/dto/CreateUser.input-dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  TUserDocument,
  type TUserModel,
  User,
} from '../../users/domain/user.entity';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { CryptoService } from '../../../../services/CryptoService';
import { DateUtils } from '../../../../utils/DateUtils';
import { AccessTokenDto } from '../dto/AccessToken.view-dto';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../../notification/email.service';
import { UsersService } from '../../users/application/users.service';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InputNewPasswordDto } from '../dto/NewPassword.input-dto';
import { JwtAccessTokenPayload } from '../types';

// TODO: to env
const CONFIRMATION_CODE_TTL_DAYS = 2;
const RECOVERY_CODE_TTL_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: TUserModel,
    private usersRepository: UsersRepository,
    private usersService: UsersService,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async registration(inputCreateUserDto: InputCreateUserDto): Promise<void> {
    const userId = await this.usersService.createUser(inputCreateUserDto);
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

  async login(userId: string): Promise<AccessTokenDto> {
    const payload: JwtAccessTokenPayload = { userId };
    const accessToken = this.jwtService.sign(payload);
    return new AccessTokenDto(accessToken);
  }

  async resendConfirmationEmail(email: string): Promise<void> {
    const userDocument = await this.usersRepository.findByEmail(email);

    if (!userDocument) return;
    if (userDocument.emailConfirmation.isConfirmed) return;

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
      RECOVERY_CODE_TTL_MINUTES,
    );

    userDocument.setRecoveryCode(recoveryCode, codeExpirationDate);

    await this.usersRepository.save(userDocument);

    this.emailService
      .sendRecoveryCode(userDocument.email, recoveryCode)
      .catch((error) => console.log('Send recovery code error: ', error));
  }

  async updatePassword(newPasswordDto: InputNewPasswordDto): Promise<void> {
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
      CONFIRMATION_CODE_TTL_DAYS,
    );

    userDocument.setEmailConfirmationCode(confirmationCode, codeExpirationDate);

    this.emailService
      .sendConfirmationCode(userDocument.email, confirmationCode)
      .catch((error) => console.log('Send confirmation code error: ', error));
  }
}
