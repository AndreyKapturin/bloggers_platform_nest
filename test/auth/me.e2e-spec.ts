import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { faker } from '@faker-js/faker';
import { JwtService } from '@nestjs/jwt';
import {
  JWT_AT_SECRET,
  JWT_AT_SERVICE,
  JWT_AT_TTL,
} from '../../src/modules/user-accounts/auth/strategies/jwt/jwt-config';

describe('get me', () => {
  let app: INestApplication;

  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let accessToken: string;

  let inputUser: HttpCreateUserDto;

  let inputLogin: HttpLoginDto;

  const jwtService = new JwtService({
    secret: JWT_AT_SECRET,
    signOptions: { expiresIn: JWT_AT_TTL },
  });

  const originalJwtSignAsync = jwtService.signAsync.bind(jwtService);
  const jwtSignAsyncMock = jest.spyOn(jwtService, 'signAsync');

  beforeAll(async () => {
    app = await initApp((builder) => {
      builder.overrideProvider(JWT_AT_SERVICE).useValue(jwtService);
    });
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);

    inputUser = usersTestHelper.createInputDto();

    await authTestHelper.registerUser(inputUser);

    inputLogin = {
      loginOrEmail: inputUser.login,
      password: inputUser.password,
    };

    accessToken = await authTestHelper.loginAndGetAccessToken(inputLogin);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return user info if passed valid token', async () => {
    const meResponse = await authTestHelper.getMe({ accessToken });

    expect(meResponse.body).toEqual({
      email: inputUser.email,
      login: inputUser.login,
      userId: expect.any(String),
    });
  });

  it('should return UNAUTHORIZED if passed invalid token', async () => {
    const invalidToken = faker.database.mongodbObjectId().toString();
    await authTestHelper.getMe({
      accessToken: invalidToken,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should return UNAUTHORIZED if access token expired', async () => {
    jwtSignAsyncMock.mockImplementationOnce(async (payload, options) => {
      return originalJwtSignAsync(payload, { ...options, expiresIn: '1s' });
    });

    const expiredAccessToken =
      await authTestHelper.createUserAndGetAccessToken();

    await new Promise((resolve) => setTimeout(resolve, 1500));

    await authTestHelper.getMe({
      accessToken: expiredAccessToken,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it('should return UNAUTHORIZED if token not passed', async () => {
    await authTestHelper.getMe({ status: HttpStatus.UNAUTHORIZED });
  });
});
