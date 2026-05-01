import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';
import { HttpNewPasswordDto } from '../../src/modules/user-accounts/auth/api/dto/HttpNewPassword.dto';
import { HttpLoginDto } from '../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { HttpEmailDto } from '../../src/modules/user-accounts/auth/api/dto/HttpEmail.dto';
import { USER_CONSTRAINTS } from '../../src/modules/user-accounts/users/domain/user.entity';
import { MockThrottlerToggle } from '../utils/MockThrottlerToggle';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('new password', () => {
  let app: INestApplication;

  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let mockSendRecoveryCode: jest.SpyInstance;
  let mockThrottlerToggle: MockThrottlerToggle;

  let inputUser: HttpCreateUserDto;
  let emailDto: HttpEmailDto;

  const stubRecoveryCode = crypto.randomUUID();
  const stubNewPussword = 'Strong_password123';

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);

    inputUser = usersTestHelper.createInputDto();
    await authTestHelper.registerUser(inputUser);
    emailDto = { email: inputUser.email };

    const throttlerGuard = app.get(ThrottlerGuard);
    mockThrottlerToggle = new MockThrottlerToggle(throttlerGuard, jest);
    mockThrottlerToggle.deactivateThrottler();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await app.close();
  });

  beforeEach(() => {
    mockSendRecoveryCode = jest
      .spyOn(fakeEmailService, 'sendRecoveryCode')
      .mockResolvedValue();
  });

  afterEach(() => {
    mockSendRecoveryCode.mockReset();
  });

  it('should update password if user exist, recovery code is valid, newPassword is valid', async () => {
    await authTestHelper.recoveryPassword(emailDto);

    const recoveryCode = mockSendRecoveryCode.mock.calls[0][1];

    const newPasswordDto: HttpNewPasswordDto = {
      newPassword: 'New_strong_password',
      recoveryCode,
    };

    await authTestHelper.updatePassword(newPasswordDto);

    const inputLoginViaOldPassword: HttpLoginDto = {
      loginOrEmail: inputUser.login,
      password: inputUser.password,
    };

    await authTestHelper.loginUser(inputLoginViaOldPassword, {
      status: HttpStatus.UNAUTHORIZED,
    });

    const inputLoginViaNewPassword: HttpLoginDto = {
      loginOrEmail: inputUser.login,
      password: newPasswordDto.newPassword,
    };

    await authTestHelper.loginUser(inputLoginViaNewPassword);
  });

  it('should return BAD REQUEST status if newPassword is empty string', async () => {
    const badNewPasswordDto: HttpNewPasswordDto = {
      newPassword: '',
      recoveryCode: stubRecoveryCode,
    };

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if newPassword is string of spaces', async () => {
    const badNewPasswordDto: HttpNewPasswordDto = {
      newPassword: ' '.repeat(5),
      recoveryCode: stubRecoveryCode,
    };

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if newPassword length is less than min', async () => {
    const badNewPasswordDto: HttpNewPasswordDto = {
      newPassword: 'a'.repeat(USER_CONSTRAINTS.PASSWORD_MIN_LENGTH - 1),
      recoveryCode: stubRecoveryCode,
    };

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if newPassword length is great than max', async () => {
    const badNewPasswordDto: HttpNewPasswordDto = {
      newPassword: 'a'.repeat(USER_CONSTRAINTS.PASSWORD_MAX_LENGTH + 1),
      recoveryCode: stubRecoveryCode,
    };

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if newPassword is not a string', async () => {
    const badNewPasswordDto = {
      newPassword: 12345,
      recoveryCode: stubRecoveryCode,
    } as unknown as HttpNewPasswordDto;

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if newPassword is not passed', async () => {
    const badNewPasswordDto = {
      recoveryCode: stubRecoveryCode,
    } as unknown as HttpNewPasswordDto;

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if recoveryCode is empty string', async () => {
    const badNewPasswordDto: HttpNewPasswordDto = {
      newPassword: stubNewPussword,
      recoveryCode: '',
    };

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if recoveryCode is string of spaces', async () => {
    const badNewPasswordDto: HttpNewPasswordDto = {
      newPassword: stubNewPussword,
      recoveryCode: ' '.repeat(5),
    };

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if recoveryCode is not a string', async () => {
    const badNewPasswordDto = {
      newPassword: stubNewPussword,
      recoveryCode: 12345,
    } as unknown as HttpNewPasswordDto;

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if recoveryCode is not passed', async () => {
    const badNewPasswordDto = {
      newPassword: stubNewPussword,
    } as unknown as HttpNewPasswordDto;

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return TO MANY REQUESTS', async () => {
    const badNewPasswordDto: HttpNewPasswordDto = {
      newPassword: stubNewPussword,
      recoveryCode: ' '.repeat(5),
    };
    const requestCount = 5;

    mockThrottlerToggle.activateThrottler();

    for (let i = 0; i < requestCount; i++) {
      await authTestHelper.updatePassword(badNewPasswordDto, {
        status: HttpStatus.BAD_REQUEST,
      });
    }

    await authTestHelper.updatePassword(badNewPasswordDto, {
      status: HttpStatus.TOO_MANY_REQUESTS,
    });

    mockThrottlerToggle.deactivateThrottler();
  });
});
