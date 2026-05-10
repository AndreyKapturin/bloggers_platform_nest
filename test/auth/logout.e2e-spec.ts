import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { initApp } from '../utils/initApp';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { debounce } from '../utils/debounce';

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

    const refreshTokenFromResponse =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse);

    const logoutResponse = await authTestHelper.logout({
      refreshToken: refreshTokenFromResponse!,
    });

    const refreshTokenFromLogoutResponse =
      authTestHelper.extractRefreshTokenFromCookie(logoutResponse);

    expect(refreshTokenFromLogoutResponse).toBeNull();

    const logoutWithRevokedTokenResponse = await authTestHelper.logout({
      refreshToken: refreshTokenFromResponse!,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should return UNAUTHORIZED if refresh token is invalid', async () => {
    const createUserDto = usersTestHelper.createInputDto();
    const loginDto: HttpLoginDto = {
      loginOrEmail: createUserDto.login,
      password: createUserDto.password,
    };

    await usersTestHelper.createUser(createUserDto);

    const loginResponse = await authTestHelper.loginUser(loginDto);

    const refreshTokenFromResponse =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse);

    await debounce(1000);

    const refreshTokensResponse = await authTestHelper.refreshTokens({
      refreshToken: refreshTokenFromResponse!,
    });

    const newRefreshToken = authTestHelper.extractRefreshTokenFromCookie(
      refreshTokensResponse,
    );

    const logoutResponse = await authTestHelper.logout({
      refreshToken: refreshTokenFromResponse!,
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
