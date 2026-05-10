import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { MockThrottlerToggle } from '../utils/MockThrottlerToggle';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('login', () => {
  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;

  let inputUser: HttpCreateUserDto;

  let mockThrottlerToggle: MockThrottlerToggle;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);
    inputUser = usersTestHelper.createInputDto();
    await authTestHelper.registerUser(inputUser);

    const throttlerGuard = app.get(ThrottlerGuard);
    mockThrottlerToggle = new MockThrottlerToggle(throttlerGuard, jest);
    mockThrottlerToggle.deactivateThrottler();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should login user via email', async () => {
    const loginViaEmail = {
      loginOrEmail: inputUser.email,
      password: inputUser.password,
    };

    const loginWithEmailResponse =
      await authTestHelper.loginUser(loginViaEmail);

    expect(loginWithEmailResponse.header['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringMatching('refreshToken=.+HttpOnly; Secure'),
      ]),
    );

    expect(loginWithEmailResponse.body).toEqual({
      accessToken: expect.any(String),
    });
  });

  it('should login user via login', async () => {
    const loginViaLogin = {
      loginOrEmail: inputUser.email,
      password: inputUser.password,
    };

    const loginViaLoginResponse = await authTestHelper.loginUser(loginViaLogin);

    expect(loginViaLoginResponse.body).toEqual({
      accessToken: expect.any(String),
    });
  });

  it.each([
    {
      testDesc: 'loginOrEmail is empty string',
      inputLogin: {
        loginOrEmail: '',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'loginOrEmail is string of spaces',
      inputLogin: {
        loginOrEmail: ' '.repeat(5),
        password: 'strong_password',
      },
    },
    {
      testDesc: 'loginOrEmail is not string',
      inputLogin: {
        loginOrEmail: 10,
        password: 'strong_password',
      },
    },
    {
      testDesc: 'loginOrEmail is not passed',
      inputLogin: {
        password: 'strong_password',
      },
    },
    {
      testDesc: 'password is empty string',
      inputLogin: {
        login: 'User_03',
        password: '',
      },
    },
    {
      testDesc: 'password is string of spaces',
      inputLogin: {
        login: 'User_03',
        password: ' '.repeat(5),
      },
    },
    {
      testDesc: 'password is not string',
      inputLogin: {
        login: 'User_03',
        password: 1223456,
      },
    },
    {
      testDesc: 'password is not passed',
      inputLogin: {
        login: 'User_03',
      },
    },
  ])(`shouldn't login user if $testDesc`, async ({ inputLogin }) => {
    await authTestHelper.loginUser(inputLogin as unknown as HttpLoginDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it(`shouldn't login user if user not exist`, async () => {
    const notExistLogin = {
      loginOrEmail: 'not_exist',
      password: 'strong_password123',
    };

    await authTestHelper.loginUser(notExistLogin, {
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should return TO MANY REQUESTS', async () => {
    const notExistLogin = {
      loginOrEmail: 'not_exist',
      password: 'strong_password123',
    };
    const requestCount = 5;

    mockThrottlerToggle.activateThrottler();

    for (let i = 0; i < requestCount; i++) {
      await authTestHelper.loginUser(notExistLogin, {
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    await authTestHelper.loginUser(notExistLogin, {
      status: HttpStatus.TOO_MANY_REQUESTS,
    });

    mockThrottlerToggle.deactivateThrottler();
  });
});
