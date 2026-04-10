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

// TODO: to env
const CONFIRMATION_CODE_TTL_DAYS = 2;

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

  async registration(
    inputCreateUserDto: InputCreateUserDto,
  ): Promise<void> {
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
    const payload = { userId };
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
