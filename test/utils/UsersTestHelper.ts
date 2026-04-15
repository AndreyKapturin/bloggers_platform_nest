import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';
import { faker } from '@faker-js/faker';
import { LOGIN_CONSTRAINTS } from '../../src/modules/user-accounts/users/constants';
import { ViewUserDto } from '../../src/modules/user-accounts/users/dto/User.view-dto';

export class UsersTestHelper {
  constructor(private app: INestApplication) {}

  async createUser(
    dto: InputCreateUserDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post('/users')
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(dto)
      .expect(options?.status ?? HttpStatus.CREATED);
  }

  async createRandomUser(): Promise<ViewUserDto> {
    const login = faker.string.alphanumeric({
      length: {
        min: LOGIN_CONSTRAINTS.MIN_LENGTH,
        max: LOGIN_CONSTRAINTS.MAX_LENGTH,
      },
      casing: 'mixed',
    });
    const email = faker.internet.email();
    const password = faker.internet.password();

    const inputUser: InputCreateUserDto = {
      login,
      email,
      password,
    };

    const createUserResponse = await this.createUser(inputUser);

    return createUserResponse.body;
  }
}
