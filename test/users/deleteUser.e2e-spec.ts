import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { UsersTestHelper } from '../utils/UsersTestHelper';

describe('delete user', () => {
  const inputUser: InputCreateUserDto = {
    login: 'User_01',
    email: 'user1@mail.ru',
    password: 'Strong_password',
  };

  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let userId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);

    const createUserResponse = await usersTestHelper.createUser(inputUser);
    userId = createUserResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should delete user if exist and admin auth passed', async () => {
    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .expect(HttpStatus.NO_CONTENT);
  });

  it(`shouldn't delete user if not admin auth`, async () => {
    await request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
