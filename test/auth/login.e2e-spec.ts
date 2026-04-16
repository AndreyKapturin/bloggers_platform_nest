import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';
import { AuthTestHelper } from '../utils/AuthTestHelper';

describe('login', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;

  const inputUser: InputCreateUserDto = {
    login: 'User_01',
    email: 'user1@mail.ru',
    password: 'strong_password',
  };

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
    authTestHelper = new AuthTestHelper(app);
    await authTestHelper.registerUser(inputUser);
  });

  it('should login user via email', async () => {
    const loginViaEmail = {
      loginOrEmail: inputUser.email,
      password: inputUser.password,
    };

    const loginWithEmailResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginViaEmail)
      .expect(HttpStatus.OK);

    expect(loginWithEmailResponse.body).toEqual({
      accessToken: expect.any(String),
    });
  });

  it('should login user via login', async () => {
    const loginViaLogin = {
      loginOrEmail: inputUser.email,
      password: inputUser.password,
    };

    const loginViaLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginViaLogin)
      .expect(HttpStatus.OK);

    expect(loginViaLoginResponse.body).toEqual({
      accessToken: expect.any(String),
    });
  });

  it(`shouldn't login user if password is wrong`, async () => {
    const loginViaLogin = {
      loginOrEmail: inputUser.email,
      password: 'wrong password',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(loginViaLogin)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it(`shouldn't login user if user not exist`, async () => {
    const notExistLogin = {
      loginOrEmail: 'not_exist',
      password: 'wrong password',
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(notExistLogin)
      .expect(HttpStatus.UNAUTHORIZED);
  });

  afterAll(async () => {
    await app.close();
  });
});
