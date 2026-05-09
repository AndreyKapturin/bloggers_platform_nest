import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { initApp } from '../utils/initApp';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';

describe('logout', () => {
  let app: INestApplication;

  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should remove refresh token from the cookie and delete device session', async () => {
    const createUserDto = usersTestHelper.createInputDto();
    const loginDto: HttpLoginDto = {
      loginOrEmail: createUserDto.login,
      password: createUserDto.password,
    };

    await usersTestHelper.createUser(createUserDto);

    const loginResponse = await authTestHelper.loginUser(loginDto);

    const refreshTokenFromResponse1 =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse);

    const logoutResponse = await authTestHelper.logout({
      refreshToken: refreshTokenFromResponse1!,
    });

    const refreshTokenFromLogoutResponse =
      authTestHelper.extractRefreshTokenFromCookie(logoutResponse);

    expect(refreshTokenFromLogoutResponse).toBeNull();

    const logoutWithRevokedTokenResponse = await authTestHelper.logout({
      refreshToken: refreshTokenFromResponse1!,
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
