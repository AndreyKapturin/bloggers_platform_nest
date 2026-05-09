import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { faker } from '@faker-js/faker';
import { SecurityTestHelper } from '../utils/SecurityTestHelper';

describe('delete all other security devices', () => {
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

  it('should delete all other security devices if refresh token is valid, device session exists', async () => {
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
    const loginResponse3 = await authTestHelper.loginUser(loginDto, {
      userAgent: userAgent3,
    });

    const refreshToken1 =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse1);

    const refreshToken2 =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse2);

    const refreshToken3 =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse3);

    expect(refreshToken1).toBeDefined();
    expect(refreshToken2).toBeDefined();
    expect(refreshToken3).toBeDefined();

    const securityDevicesResponse = await securityTestHelper.getSecurityDevices(
      { refreshToken: refreshToken1! },
    );

    expect(securityDevicesResponse.body).toHaveLength(3);

    const deviceId1 = securityDevicesResponse.body[0].deviceId;

    await securityTestHelper.deleteAllOtherSecurityDevices({
      refreshToken: refreshToken1!,
    });

    await securityTestHelper.getSecurityDevices({
      refreshToken: refreshToken2!,
      status: HttpStatus.UNAUTHORIZED,
    });

    await securityTestHelper.getSecurityDevices({
      refreshToken: refreshToken3!,
      status: HttpStatus.UNAUTHORIZED,
    });

    const securityDevicesResponse2 =
      await securityTestHelper.getSecurityDevices({
        refreshToken: refreshToken1!,
      });

    expect(securityDevicesResponse2.body).toHaveLength(1);
    expect(securityDevicesResponse2.body[0].deviceId).toBe(deviceId1);
  });

  it(`shouldn't delete devices if refresh token is invalid`, async () => {
    const invalidRefreshToken = faker.internet.jwt();

    await securityTestHelper.deleteAllOtherSecurityDevices({
      refreshToken: invalidRefreshToken,
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
