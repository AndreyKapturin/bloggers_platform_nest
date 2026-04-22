import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';

describe('login', () => {
  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;

  let inputUser: InputCreateUserDto;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);
    inputUser = usersTestHelper.createInputDto();
    await authTestHelper.registerUser(inputUser);
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
      expect.arrayContaining([expect.stringMatching('refreshToken=')]),
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

  it(`shouldn't login user if password is wrong`, async () => {
    const loginViaLogin = {
      loginOrEmail: inputUser.email,
      password: 'wrong password',
    };

    await authTestHelper.loginUser(loginViaLogin, {
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't login user if user not exist`, async () => {
    const notExistLogin = {
      loginOrEmail: 'not_exist',
      password: 'wrong password',
    };

    await authTestHelper.loginUser(notExistLogin, {
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
