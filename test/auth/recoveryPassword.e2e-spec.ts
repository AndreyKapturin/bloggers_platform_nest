import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { HttpEmailDto } from '../../src/modules/user-accounts/auth/api/dto/HttpEmail.dto';
import { MockThrottlerToggle } from '../utils/MockThrottlerToggle';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('recovery password', () => {
  let app: INestApplication;

  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let mockSendRecoveryCode: jest.SpyInstance;
  let mockThrottlerToggle: MockThrottlerToggle;

  let inputUser: HttpCreateUserDto;

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
    jest.restoreAllMocks();
    await app.close();
  });

  beforeEach(() => {
    mockSendRecoveryCode = jest.spyOn(fakeEmailService, 'sendRecoveryCode');
  });

  afterEach(() => {
    mockSendRecoveryCode.mockReset();
  });

  it('should send recovery code if user exist', async () => {
    const emailDto: HttpEmailDto = { email: inputUser.email };
    await authTestHelper.recoveryPassword(emailDto);
    const recoveryCode = mockSendRecoveryCode.mock.calls[0][1];
    expect(recoveryCode).toEqual(expect.any(String));
  });

  it(`should return NO CONTENT status if user not exist. Email shouldn't send`, async () => {
    const notExistedEmailDto: HttpEmailDto = { email: 'not_exist@mail.ru' };
    await authTestHelper.recoveryPassword(notExistedEmailDto, {
      status: HttpStatus.NO_CONTENT,
    });

    expect(mockSendRecoveryCode).not.toHaveBeenCalled();
  });

  it('should return BAD REQUEST status if email is empty string', async () => {
    const badEmailDto: HttpEmailDto = { email: '' };
    await authTestHelper.recoveryPassword(badEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if email is string of spaces', async () => {
    const badEmailDto: HttpEmailDto = { email: ' '.repeat(5) };
    await authTestHelper.recoveryPassword(badEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if email is not a string', async () => {
    const badEmailDto = { email: 101 } as unknown as HttpEmailDto;
    await authTestHelper.recoveryPassword(badEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if email is not passed', async () => {
    const badEmailDto = {} as unknown as HttpEmailDto;
    await authTestHelper.recoveryPassword(badEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return TO MANY REQUESTS', async () => {
    const notExistedEmailDto: HttpEmailDto = { email: 'not_exist@mail.ru' };
    const requestCount = 5;

    mockThrottlerToggle.activateThrottler();

    for (let i = 0; i < requestCount; i++) {
      await authTestHelper.recoveryPassword(notExistedEmailDto, {
        status: HttpStatus.NO_CONTENT,
      });
    }

    await authTestHelper.recoveryPassword(notExistedEmailDto, {
      status: HttpStatus.TOO_MANY_REQUESTS,
    });

    mockThrottlerToggle.deactivateThrottler();
  });
});
