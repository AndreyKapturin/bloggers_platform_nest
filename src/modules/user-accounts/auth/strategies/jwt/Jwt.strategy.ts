import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserInRequestDto } from '../../../../../core/dto/UserInRequest.dto';
import { JwtAccessTokenPayload } from '../../types';
import { JWT_AT_SECRET } from './jwt-config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_AT_SECRET,
    });
  }

  async validate(payload: JwtAccessTokenPayload): Promise<UserInRequestDto> {
    return { id: payload.userId };
  }
}
