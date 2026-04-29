import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';
import { AuthTestHelper } from '../utils/AuthTestHelper';

const loginUser = async (
  app: INestApplication,
  inputLoginDto: HttpLoginDto,
): Promise<Response> => {
  return request(app.getHttpServer()).post('/auth/login').send(inputLoginDto);
};

describe('get me', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;
  let accessToken: string;

  const inputUser: HttpCreateUserDto = {
    login: 'User_01',
    email: 'user1@mail.ru',
    password: 'strong_password',
  };

  const inputLogin: HttpLoginDto = {
    loginOrEmail: inputUser.login,
    password: inputUser.password,
  };

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
    authTestHelper = new AuthTestHelper(app);
    await authTestHelper.registerUser(inputUser);

    const loginResponse = await loginUser(app, inputLogin);
    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return user info if passed valid token', async () => {
    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .auth(accessToken, { type: 'bearer' });

    expect(meResponse.status).toBe(HttpStatus.OK);
    expect(meResponse.body).toEqual({
      email: inputUser.email,
      login: inputUser.login,
      userId: expect.any(String),
    });
  });

  it('should return UNAUTHORIZED if passed invalid token', async () => {
    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .auth('invalid.token', { type: 'bearer' });
    expect(meResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  it('should return UNAUTHORIZED if token not passed', async () => {
    const meResponse = await request(app.getHttpServer()).get('/auth/me');
    expect(meResponse.status).toBe(HttpStatus.UNAUTHORIZED);
  });
});
