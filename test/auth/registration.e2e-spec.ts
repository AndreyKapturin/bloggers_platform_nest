import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';

describe('registration', () => {
  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;

  let inputUser: HttpCreateUserDto;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);
    inputUser = usersTestHelper.createInputDto();
  });

  it('should register user if data is correct', async () => {
    const mocksendConfirmationCode = jest.spyOn(
      fakeEmailService,
      'sendConfirmationCode',
    );

    await authTestHelper.registerUser(inputUser);
    await authTestHelper.loginUser({
      loginOrEmail: inputUser.login,
      password: inputUser.password,
    });

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

    const response = await authTestHelper.registerUser(equalLogin, {
      status: HttpStatus.BAD_REQUEST,
    });
    expect(response.body.errorsMessages[0].field).toBe('login');
  });

  it(`shouldn't register user if email is busy`, async () => {
    const equalEmail = {
      ...inputUser,
      login: 'User_02',
    };

    const response = await authTestHelper.registerUser(equalEmail, {
      status: HttpStatus.BAD_REQUEST,
    });
    expect(response.body.errorsMessages[0].field).toBe('email');
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
      testDesc: 'login is string of spaces',
      inputUser: {
        login: ' '.repeat(5),
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
      testDesc: 'email is string of spaces',
      inputUser: {
        login: 'User_02',
        email: ' '.repeat(5),
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
      testDesc: 'password is string of spaces',
      inputUser: {
        login: 'User_03',
        email: 'user_3@mail.ru',
        password: ' '.repeat(5),
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
    await authTestHelper.registerUser(
      inputUser as unknown as HttpCreateUserDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't register user if multiple fields are invalid`, async () => {
    const response = await authTestHelper.registerUser(
      { email: '', login: 10, password: '123' } as unknown as HttpCreateUserDto,
      { status: HttpStatus.BAD_REQUEST },
    );
    expect(response.body.errorsMessages).toEqual(
      expect.arrayContaining([
        {
          field: 'email',
          message: expect.any(String),
        },
        {
          field: 'login',
          message: expect.any(String),
        },
        {
          field: 'password',
          message: expect.any(String),
        },
      ]),
    );
  });

  afterAll(async () => {
    await app.close();
  });
});
