import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { AuthTestHelper } from '../utils/AuthTestHelper';

describe('registration', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;

  const inputUser = {
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
  });

  it('should register user if data is correct', async () => {
    const mocksendConfirmationCode = jest.spyOn(
      fakeEmailService,
      'sendConfirmationCode',
    );

    await authTestHelper.registerUser(inputUser);

    expect(mocksendConfirmationCode).toHaveBeenCalledTimes(1);
    expect(mocksendConfirmationCode).toHaveBeenCalledWith(
      inputUser.email,
      expect.any(String),
    );

    mocksendConfirmationCode.mockRestore();
  });

  it(`shouldn't register user if login is busy`, async () => {
    const equalLogin = {
      ...inputUser,
      email: 'user2@mail.ru',
    };

    await authTestHelper.registerUser(equalLogin, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it(`shouldn't register user if email is busy`, async () => {
    const equalEmail = {
      ...inputUser,
      login: 'User_02',
    };

    await authTestHelper.registerUser(equalEmail, {
      status: HttpStatus.BAD_REQUEST,
    });
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
  ])(`shouldn't register user if $testDesc`, async ({ inputUser }) => {
    await authTestHelper.registerUser(inputUser, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
