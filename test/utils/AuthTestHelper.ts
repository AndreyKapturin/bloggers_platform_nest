import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';
import { InputLoginDto } from '../../src/modules/user-accounts/auth/dto/Login.input-dto';
import { UsersTestHelper } from './UsersTestHelper';

export class AuthTestHelper {
  constructor(
    private app: INestApplication,
    private usersTestHelper: UsersTestHelper,
  ) {}

  async registerUser(
    inputCreateUserDto: InputCreateUserDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/registration')
      .send(inputCreateUserDto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async confirmRegistration(
    code: string,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({ code })
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
  }

  async loginUser(
    dto: InputLoginDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return await request(this.app.getHttpServer())
      .post('/auth/login')
      .send(dto)
      .expect(options?.status ?? HttpStatus.OK);
  }

  async loginAndGetAccessToken(dto: InputLoginDto): Promise<string> {
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
}
