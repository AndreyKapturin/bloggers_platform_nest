import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { faker } from '@faker-js/faker';
import { SecurityTestHelper } from '../utils/SecurityTestHelper';

describe('delete security device', () => {
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

  it('should delete security device if refresh token is valid, device session exists', async () => {
    const createUserDto = usersTestHelper.createInputDto();
    const loginDto: HttpLoginDto = {
      loginOrEmail: createUserDto.login,
      password: createUserDto.password,
    };

    await usersTestHelper.createUser(createUserDto);

    const userAgent1 = faker.internet.userAgent();
    const userAgent2 = faker.internet.userAgent();

    const loginResponse1 = await authTestHelper.loginUser(loginDto, {
      userAgent: userAgent1,
    });
    const loginResponse2 = await authTestHelper.loginUser(loginDto, {
      userAgent: userAgent2,
    });

    const refreshToken1 =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse1);

    const refreshToken2 =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse2);

    expect(refreshToken1).toBeDefined();
    expect(refreshToken2).toBeDefined();

    const securityDevicesResponse = await securityTestHelper.getSecurityDevices(
      {
        refreshToken: refreshToken1!,
      },
    );

    expect(securityDevicesResponse.body).toHaveLength(2);

    const deviceId1 = securityDevicesResponse.body[0].deviceId;

    await securityTestHelper.deleteSecurityDevice(deviceId1, {
      refreshToken: refreshToken2!,
    });

    await securityTestHelper.getSecurityDevices({
      refreshToken: refreshToken1!,
      status: HttpStatus.UNAUTHORIZED,
    });
    await securityTestHelper.getSecurityDevices({
      refreshToken: refreshToken2!,
    });
  });

  it(`shouldn't delete device if refresh token is invalid`, async () => {
    const invalidRefreshToken = faker.internet.jwt();
    const randomDeviceId = crypto.randomUUID();

    await securityTestHelper.deleteSecurityDevice(randomDeviceId, {
      refreshToken: invalidRefreshToken,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't delete device if it belongs to another user`, async () => {
    const createUserDto1 = usersTestHelper.createInputDto();
    const createUserDto2 = usersTestHelper.createInputDto();
    const loginDto1: HttpLoginDto = {
      loginOrEmail: createUserDto1.login,
      password: createUserDto1.password,
    };
    const loginDto2: HttpLoginDto = {
      loginOrEmail: createUserDto2.login,
      password: createUserDto2.password,
    };

    await usersTestHelper.createUser(createUserDto1);
    await usersTestHelper.createUser(createUserDto2);

    const loginUser1Response = await authTestHelper.loginUser(loginDto1);
    const loginUser2Response = await authTestHelper.loginUser(loginDto2);

    const user1RefreshToken =
      authTestHelper.extractRefreshTokenFromCookie(loginUser1Response);
    const user2RefreshToken =
      authTestHelper.extractRefreshTokenFromCookie(loginUser2Response);

    const user1Devices = await securityTestHelper.getSecurityDevices({
      refreshToken: user1RefreshToken!,
    });
    const user1DeviceId = user1Devices.body[0].deviceId;

    await securityTestHelper.deleteSecurityDevice(user1DeviceId, {
      refreshToken: user2RefreshToken!,
      status: HttpStatus.FORBIDDEN,
    });
  });

  it(`shouldn't delete device if device not exist`, async () => {
    const randomDeviceId = crypto.randomUUID();

    const createUserDto = usersTestHelper.createInputDto();
    const loginDto: HttpLoginDto = {
      loginOrEmail: createUserDto.login,
      password: createUserDto.password,
    };

    await usersTestHelper.createUser(createUserDto);

    const loginResponse = await authTestHelper.loginUser(loginDto);

    const refreshToken =
      authTestHelper.extractRefreshTokenFromCookie(loginResponse);

    await securityTestHelper.deleteSecurityDevice(randomDeviceId, {
      refreshToken: refreshToken!,
      status: HttpStatus.NOT_FOUND,
    });
  });
});
