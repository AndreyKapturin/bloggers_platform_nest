import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { UsersTestHelper } from './UsersTestHelper';
import { HttpEmailDto } from '../../src/modules/user-accounts/auth/api/dto/HttpEmail.dto';
import { HttpConfirmationCodeDto } from '../../src/modules/user-accounts/auth/api/dto/HttpConfirmationCode.dto';
import { HttpNewPasswordDto } from '../../src/modules/user-accounts/auth/api/dto/HttpNewPassword.dto';
import { ViewMeDto } from '../../src/modules/user-accounts/users/api/dto/ViewMe.dto';
import { ResponseWithBody } from './generics';
import { AccessTokenDto } from '../../src/modules/user-accounts/auth/dto/AccessToken.view-dto';

export class AuthTestHelper {
  constructor(
    private app: INestApplication,
    private usersTestHelper: UsersTestHelper,
  ) {}

  extractRefreshTokenFromCookie(response: Response): string | null {
    const setCookieHeader = response.headers['set-cookie'];
    const cookies = Array.isArray(setCookieHeader)
      ? setCookieHeader
      : [setCookieHeader];
    const match = cookies.join(' ').match(/refreshToken=([^;]+)/);
    return match ? match[1] : null;
  }

  async getMe<T = ViewMeDto>(options?: {
    status?: HttpStatus;
    accessToken?: string;
  }): Promise<ResponseWithBody<T>> {
    const getMeRequest = request(this.app.getHttpServer())
      .get('/auth/me')
      .expect(options?.status ?? HttpStatus.OK);

    if (options?.accessToken) {
      getMeRequest.auth(options.accessToken, { type: 'bearer' });
    }

    return getMeRequest;
  }

  async registerUser(
    inputCreateUserDto: HttpCreateUserDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(inputCreateUserDto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async confirmRegistration(
    dto: HttpConfirmationCodeDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send(dto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async loginUser<T = AccessTokenDto>(
    dto: HttpLoginDto,
    options?: { status: HttpStatus },
  ): Promise<ResponseWithBody<T>> {
    return await request(this.app.getHttpServer())
      .post('/auth/login')
      .send(dto)
      .expect(options?.status ?? HttpStatus.OK);
  }

  async loginAndGetAccessToken(dto: HttpLoginDto): Promise<string> {
    const loginResponse = await this.loginUser(dto);
    return loginResponse.body.accessToken;
  }

  async createUserAndGetAccessToken(): Promise<string> {
    const inputUser = this.usersTestHelper.createInputDto();
    await this.usersTestHelper.createUser(inputUser);
    const accessToken = await this.loginAndGetAccessToken({
      loginOrEmail: inputUser.email,
      password: inputUser.password,
    });
    return accessToken;
  }

  async resendConfirmationCode(
    dto: HttpEmailDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send(dto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async recoveryPassword(
    dto: HttpEmailDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/password-recovery')
      .send(dto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async updatePassword(
    dto: HttpNewPasswordDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/new-password')
      .send(dto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async refreshTokens(options?: {
    status?: HttpStatus;
    refreshToken?: string;
  }) {
    options = {
      status: HttpStatus.OK,
      ...(options ?? {}),
    };
    const refreshTokensRequest = request(this.app.getHttpServer())
      .post('/auth/refresh-token')
      .expect(options.status as HttpStatus);

    if (options.refreshToken) {
      refreshTokensRequest.set(
        'Cookie',
        `refreshToken=${options.refreshToken}`,
      );
    }

    return refreshTokensRequest;
  }
}
