import { BasicStrategy as Strategy } from 'passport-http';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../../../../core/constants';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super();
  }

  public validate = async (
    login: string,
    password: string,
  ): Promise<boolean> => {
    if (ADMIN_LOGIN === login && ADMIN_PASSWORD === password) {
      return true;
    }
    throw new UnauthorizedException();
  };
}
