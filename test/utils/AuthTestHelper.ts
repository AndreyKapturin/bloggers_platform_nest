import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { UsersTestHelper } from './UsersTestHelper';
import { HttpEmailDto } from '../../src/modules/user-accounts/auth/api/dto/HttpEmail.dto';
import { HttpConfirmationCodeDto } from '../../src/modules/user-accounts/auth/api/dto/HttpConfirmationCode.dto';
import { HttpNewPasswordDto } from '../../src/modules/user-accounts/auth/api/dto/HttpNewPassword.dto';

export class AuthTestHelper {
  constructor(
    private app: INestApplication,
    private usersTestHelper: UsersTestHelper,
  ) {}

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

  async loginUser(
    dto: HttpLoginDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
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
}
