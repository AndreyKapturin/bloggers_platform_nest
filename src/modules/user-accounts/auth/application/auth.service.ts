import { Injectable } from '@nestjs/common';
import { InputRegistrationDto } from '../dto/Registration.input-dto';
import { InjectModel } from '@nestjs/mongoose';
import { type TUserModel, User } from '../../users/domain/user.entity';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { CryptoService } from '../../../../services/CryptoService';
import { DateUtils } from '../../../../utils/DateUtils';
import { AccessTokenDto } from '../dto/AccessToken.view-dto';
import { JwtService } from '@nestjs/jwt';

// TODO: to env
const CONFIRMATION_CODE_TTL_DAYS = 2;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private UserModel: TUserModel,
    private usersRepository: UsersRepository,
    private cryptoService: CryptoService,
    private jwtService: JwtService,
  ) {}

  async registration(
    inputRegistrationDto: InputRegistrationDto,
  ): Promise<void> {
    const { email, login, password } = inputRegistrationDto;
    const isEmailBusy = await this.usersRepository.findByEmail(email);

    if (isEmailBusy) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User already exists',
        [
          {
            field: 'email',
            message: 'User with passed email already exists',
          },
        ],
      );
    }

    const isLoginBusy = await this.usersRepository.findByLogin(login);

    if (isLoginBusy) {
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'User already exists',
        [
          {
            field: 'login',
            message: 'User with passed login already exists',
          },
        ],
      );
    }

    const passwordHash = await this.cryptoService.hash(password);
    const confirmationCode = crypto.randomUUID();
    const codeExpirationDate = DateUtils.getDatePlusDays(
      CONFIRMATION_CODE_TTL_DAYS,
    );

    const newUserDocument = this.UserModel.makeUnconfirmedInstanse({
      login,
      email,
      passwordHash,
      confirmationCode,
      codeExpirationDate,
    });

    await this.usersRepository.save(newUserDocument);

    // TODO: send email confirmation code
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
}
