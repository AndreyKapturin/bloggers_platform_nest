import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';

describe('create user', () => {
  const ADMIN_LOGIN = 'admin';
  const ADMIN_PASSWORD = 'qwerty';

  const inputUser: InputCreateUserDto = {
    login: 'User_01',
    email: 'user1@mail.ru',
    password: 'Strong_password',
  };

  let app: INestApplication;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and return user', async () => {
    const createUserResponse = await request(app.getHttpServer())
      .post('/users')
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(inputUser);

    expect(createUserResponse.status).toBe(HttpStatus.CREATED);
    expect(createUserResponse.body).toEqual({
      id: expect.any(String),
      login: inputUser.login,
      email: inputUser.email,
      createdAt: expect.any(String),
    });
  });

  it(`shouldn't create user if login is busy`, async () => {
    const equalLogin: InputCreateUserDto = {
      ...inputUser,
      email: 'unique@mail.ru',
    };

    await request(app.getHttpServer())
      .post('/users')
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(equalLogin)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it(`shouldn't create user if email is busy`, async () => {
    const equalEmail: InputCreateUserDto = {
      ...inputUser,
      login: 'unique',
    };

    await request(app.getHttpServer())
      .post('/users')
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(equalEmail)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it.each([
    {
      testDesc: 'login is empty string',
      inputUser: {
        login: '',
        email: 'user_2@mail.ru',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'login is not string',
      inputUser: {
        login: 10,
        email: 'user_2@mail.ru',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'login is not passed',
      inputUser: {
        email: 'user_2@mail.ru',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'email is empty string',
      inputUser: {
        login: 'User_02',
        email: '',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'email has incorrect format',
      inputUser: {
        login: 'User_02',
        email: 'usermail.ru',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'email is not passed',
      inputUser: {
        login: 'User_02',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'password is empty string',
      inputUser: {
        login: 'User_03',
        email: 'user_3@mail.ru',
        password: '',
      },
    },
    {
      testDesc: 'password is not string',
      inputUser: {
        login: 'User_03',
        email: 'user_3@mail.ru',
        password: 1223456,
      },
    },
    {
      testDesc: 'password is not passed',
      inputUser: {
        login: 'User_03',
        email: 'user_3@mail.ru',
      },
    },
  ])(`shouldn't create user if $testDesc`, async ({ inputUser }) => {
    {
      await request(app.getHttpServer())
        .post('/users')
        .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
        .send(inputUser)
        .expect(HttpStatus.BAD_REQUEST);
    }
  });

  it(`shouldn't create user if not admin auth`, async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send(inputUser)
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
