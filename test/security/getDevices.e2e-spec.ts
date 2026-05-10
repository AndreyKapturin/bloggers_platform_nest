import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { faker } from '@faker-js/faker';
import { SecurityTestHelper } from '../utils/SecurityTestHelper';

describe('get security devices', () => {
  let app: INestApplication;

  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let securityTestHelper: SecurityTestHelper;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);
    securityTestHelper = new SecurityTestHelper(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return security devices if refresh token is valid', async () => {
    const createUserDto = usersTestHelper.createInputDto();
    const loginDto: HttpLoginDto = {
      loginOrEmail: createUserDto.login,
      password: createUserDto.password,
    };

    await usersTestHelper.createUser(createUserDto);

    const userAgent1 = faker.internet.userAgent();
    const userAgent2 = faker.internet.userAgent();
    const userAgent3 = faker.internet.userAgent();

    const loginResponse1 = await authTestHelper.loginUser(loginDto, {
      userAgent: userAgent1,
    });
    const loginResponse2 = await authTestHelper.loginUser(loginDto, {
      userAgent: userAgent2,
    });
    await authTestHelper.loginUser(loginDto, {
      userAgent: userAgent3,
    });

    const refreshToken1 =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse1);

    const refreshToken2 =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse2);

    expect(refreshToken1).toBeDefined();

    let securityDevicesResponse = await securityTestHelper.getSecurityDevices({
      refreshToken: refreshToken1!,
    });

    expect(securityDevicesResponse.body).toBeInstanceOf(Array);
    expect(securityDevicesResponse.body).toHaveLength(3);
    expect(securityDevicesResponse.body).toEqual(
      expect.arrayOf(securityTestHelper.createExpectedSecurityDevice()),
    );

    await authTestHelper.logout({ refreshToken: refreshToken2! });

    securityDevicesResponse = await securityTestHelper.getSecurityDevices({
      refreshToken: refreshToken1!,
    });

    expect(securityDevicesResponse.body).toHaveLength(2);
  });

  it(`shouldn't return security devices if refresh token is revoked `, async () => {
    const createUserDto = usersTestHelper.createInputDto();
    const loginDto: HttpLoginDto = {
      loginOrEmail: createUserDto.login,
      password: createUserDto.password,
    };

    await usersTestHelper.createUser(createUserDto);

    const userAgent = faker.internet.userAgent();

    const loginResponse = await authTestHelper.loginUser(loginDto, {
      userAgent: userAgent,
    });

    const refreshToken =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse);

    await authTestHelper.logout({ refreshToken: refreshToken! });

    await securityTestHelper.getSecurityDevices({
      refreshToken: refreshToken!,
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
