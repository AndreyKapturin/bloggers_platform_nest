import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import { UserInRequest } from '../../dto/UserInRequest.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  async validate(
    loginOrEmail: string,
    password: string,
  ): Promise<UserInRequest | null> {
    const userId = await this.authService.validateUser(loginOrEmail, password);

    if (!userId) {
      throw new DomainException(
        DomainExceptionStatus.InvalidCredentials,
        'Invalid credentials',
        [
          {
            field: 'loginOrEmail',
            message: 'Invalid credentials',
          },
        ],
      );
    }

    return new UserInRequest(userId);
  }
}
