import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserInRequestDto } from '../../../../../core/dto/UserInRequest.dto';
import { JwtAccessTokenPayload } from '../../types';
import { UserAccountsConfig } from '../../../user-accounts.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(userAccountsConfig: UserAccountsConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.accessTokenSecret,
    });
  }

  async validate(payload: JwtAccessTokenPayload): Promise<UserInRequestDto> {
    return { id: payload.userId };
  }
}
