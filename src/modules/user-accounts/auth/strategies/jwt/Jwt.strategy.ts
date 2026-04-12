import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserInRequest } from '../../dto/UserInRequest.dto';
import { JwtAccessTokenPayload } from '../../types';

// TODO: to env
const JWT_AT_SECRET = 'c785q4nct98';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_AT_SECRET,
    });
  }

  async validate(payload: JwtAccessTokenPayload): Promise<UserInRequest> {
    return { id: payload.userId };
  }
}
