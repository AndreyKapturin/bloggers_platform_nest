import { Injectable } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../../core/exceptions/DomainException';
import { UserInRequest } from '../../dto/UserInRequest.dto';
import { Request } from 'express';
import { HttpLoginDto } from '../../api/dto/HttpLogin.dto';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { formatError } from '../../../../../core/validation/formatter/formatError';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'loginOrEmail' });
  }

  authenticate(req: Request, options?: any): void {
    const dto = plainToInstance(HttpLoginDto, { ...req.body });
    const errors = validateSync(dto, { stopAtFirstError: true });

    if (errors.length) {
      const formattedErrors = errors.map(formatError);
      throw new DomainException(
        DomainExceptionStatus.InvalidData,
        'Invalid data',
        formattedErrors,
      );
    }

    super.authenticate(req, options);
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
