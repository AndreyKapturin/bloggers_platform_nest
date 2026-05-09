import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { initApp } from '../utils/initApp';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { JWT_RT_SERVICE } from '../../src/modules/user-accounts/auth/strategies/jwt/jwt-config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { debounce } from '../utils/debounce';

describe('refresh tokens', () => {
  let app: INestApplication;

  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;

  let mockRefreshTokenSignAsync: jest.SpyInstance<
    Promise<string>,
    [payload: object, options?: JwtSignOptions | undefined],
    any
  >;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);

    const refreshTokenJwtService = app.get<JwtService>(JWT_RT_SERVICE);
    mockRefreshTokenSignAsync = jest.spyOn(refreshTokenJwtService, 'signAsync');

    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update tokens pair. Return new accessToken in body and new refreshToken in cookie', async () => {
    const createUserDto = usersTestHelper.createInputDto();
    const loginDto: HttpLoginDto = {
      loginOrEmail: createUserDto.login,
      password: createUserDto.password,
    };

    await usersTestHelper.createUser(createUserDto);

    const loginResponse = await authTestHelper.loginUser(loginDto);

    const accessTokenFromResponse1 = loginResponse.body.accessToken;
    const refreshTokenFromResponse1 =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse);

    const refreshTokenFromService1 = (await mockRefreshTokenSignAsync.mock
      .results[0].value) as string;

    expect(refreshTokenFromResponse1).toBe(refreshTokenFromService1);

    await debounce(500);

    const refreshTokenResponse = await authTestHelper.refreshTokens({
      refreshToken: refreshTokenFromResponse1!,
    });

    const accessTokenFromResponse2 = refreshTokenResponse.body.accessToken;
    const refreshTokenFromResponse2 =
      authTestHelper.extractRefreshTokenFromCookie(refreshTokenResponse);

    const refreshTokenFromService2 =
      await mockRefreshTokenSignAsync.mock.results[1].value;

    expect(refreshTokenFromResponse2).toBe(refreshTokenFromService2);
    expect(accessTokenFromResponse1).not.toBe(accessTokenFromResponse2);
    expect(refreshTokenFromResponse1).not.toBe(refreshTokenFromResponse2);

    const refreshTokenWithRevokedTokenResponse =
      await authTestHelper.refreshTokens({
        refreshToken: refreshTokenFromResponse1!,
        status: HttpStatus.UNAUTHORIZED,
      });
  });
});
