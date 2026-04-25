import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';
import { faker } from '@faker-js/faker';
import { ViewUserDto } from '../../src/modules/user-accounts/users/api/dto/ViewUser.dto';
import { USER_CONSTRAINTS } from '../../src/modules/user-accounts/users/domain/user.entity';
import { ResponseWithBody } from './generics';
import { PaginatedView } from '../../src/core/dto/PaginatedView.dto';
import { UserQueryParamsDto } from '../../src/modules/user-accounts/users/api/dto/UserQueryParams.dto';

export class UsersTestHelper {
  constructor(private app: INestApplication) {}

  createInputDto(): HttpCreateUserDto {
    const login = faker.string.alphanumeric({
      length: {
        min: USER_CONSTRAINTS.LOGIN_MIN_LENGTH,
        max: USER_CONSTRAINTS.LOGIN_MAX_LENGTH,
      },
      casing: 'mixed',
    });
    const email = faker.internet.email();
    const password = faker.internet.password();

    return {
      login,
      email,
      password,
    };
  }

  createExpectedUser(overrideFields: Partial<ViewUserDto> = {}): ViewUserDto {
    return {
      id: expect.any(String),
      email: expect.any(String),
      login: expect.any(String),
      createdAt: expect.any(String),
      ...overrideFields,
    };
  }

  createExpectedPaginatedUser(
    overrideFields: Partial<PaginatedView<ViewUserDto>> = {},
  ): PaginatedView<ViewUserDto> {
    return {
      page: expect.any(Number),
      pagesCount: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: expect.arrayOf(this.createExpectedUser()),
      ...overrideFields,
    };
  }

  async createUser<T = ViewUserDto>(
    dto: HttpCreateUserDto,
    options?: { status?: HttpStatus; auth?: boolean },
  ): Promise<ResponseWithBody<T>> {
    const innerOptions = {
      status: HttpStatus.CREATED,
      auth: true,
      ...(options ?? {}),
    };

    const createUserRequest = request(this.app.getHttpServer())
      .post('/users')
      .send(dto)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      createUserRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return createUserRequest;
  }

  async createRandomUser(): Promise<ViewUserDto> {
    const dto = this.createInputDto();
    const createUserResponse = await this.createUser(dto);
    return createUserResponse.body;
  }

  async createRandomUsers(count: number): Promise<ViewUserDto[]> {
    const responses = new Array(count);

    for (let i = 0; i < count; i++) {
      responses[i] = await this.createRandomUser();
    }

    return responses;
  }

  async getUsers(options?: {
    auth?: boolean;
    status?: HttpStatus;
    filter?: Partial<UserQueryParamsDto>;
  }): Promise<ResponseWithBody<PaginatedView<ViewUserDto>>> {
    const innerOptions = {
      auth: true,
      status: HttpStatus.OK,
      filter: {},
      ...(options ?? {}),
    };

    const getUsersRequest = request(this.app.getHttpServer())
      .get('/users')
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      getUsersRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    if (innerOptions.filter) {
      getUsersRequest.query(innerOptions.filter);
    }

    return getUsersRequest;
  }

  async deleteUser(
    userId: string,
    options?: { status?: HttpStatus; auth?: boolean },
  ): Promise<Response> {
    const innerOptions = {
      status: HttpStatus.NO_CONTENT,
      auth: true,
      ...(options ?? {}),
    };

    const deleteUserRequest = request(this.app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      deleteUserRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return deleteUserRequest;
  }
}
