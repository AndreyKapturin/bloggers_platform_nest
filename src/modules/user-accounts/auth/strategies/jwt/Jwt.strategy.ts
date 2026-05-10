import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserInRequestDto } from '../../../../../core/dto/UserInRequest.dto';
import { UserAccountsConfig } from '../../../user-accounts.config';
import { JwtAccessTokenDecodedPayload } from '../../types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(userAccountsConfig: UserAccountsConfig) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: userAccountsConfig.accessTokenSecret,
    });
  }

  async validate(
    payload: JwtAccessTokenDecodedPayload,
  ): Promise<UserInRequestDto> {
    return { userId: payload.userId };
  }
}
