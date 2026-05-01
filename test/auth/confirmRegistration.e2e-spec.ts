import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { HttpConfirmationCodeDto } from '../../src/modules/user-accounts/auth/api/dto/HttpConfirmationCode.dto';
import { MockThrottlerToggle } from '../utils/MockThrottlerToggle';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('registration-confirmation', () => {
  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let mockSendConfirmationCode: jest.SpyInstance;
  let mockThrottlerToggle: MockThrottlerToggle;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);

    const throttlerGuard = app.get(ThrottlerGuard);
    mockThrottlerToggle = new MockThrottlerToggle(throttlerGuard, jest);
    mockThrottlerToggle.deactivateThrottler();
  });

  beforeEach(() => {
    mockSendConfirmationCode = jest.spyOn(
      fakeEmailService,
      'sendConfirmationCode',
    );
  });

  afterEach(() => {
    mockSendConfirmationCode.mockRestore();
  });

  it('should confirm registration', async () => {
    const inputUser = usersTestHelper.createInputDto();
    await authTestHelper.registerUser(inputUser);
    const confirmationCode = mockSendConfirmationCode.mock.calls[0][1];
    const codeDto: HttpConfirmationCodeDto = { code: confirmationCode };
    await authTestHelper.confirmRegistration(codeDto);
  });

  it('should return BAD REQUEST if user already confirmed', async () => {
    const inputUser = usersTestHelper.createInputDto();
    await authTestHelper.registerUser(inputUser);
    const confirmationCode = mockSendConfirmationCode.mock.calls[0][1];

    const codeDto: HttpConfirmationCodeDto = { code: confirmationCode };

    await authTestHelper.confirmRegistration(codeDto);

    await authTestHelper.confirmRegistration(codeDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if confirmation code is empty string', async () => {
    const badCodeDto: HttpConfirmationCodeDto = { code: '' };
    await authTestHelper.confirmRegistration(badCodeDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if confirmation code is string of spaces', async () => {
    const badCodeDto: HttpConfirmationCodeDto = { code: ' '.repeat(5) };
    await authTestHelper.confirmRegistration(badCodeDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST if confirmation code does not belong to the user', async () => {
    const badCodeDto: HttpConfirmationCodeDto = { code: crypto.randomUUID() };
    await authTestHelper.confirmRegistration(badCodeDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return TO MANY REQUESTS', async () => {
    mockThrottlerToggle.activateThrottler();

    const requestCount = 5;
    const badCodeDto: HttpConfirmationCodeDto = { code: '' };

    for (let i = 0; i < requestCount; i++) {
      await authTestHelper.confirmRegistration(badCodeDto, {
        status: HttpStatus.BAD_REQUEST,
      });
    }

    await authTestHelper.confirmRegistration(badCodeDto, {
      status: HttpStatus.TOO_MANY_REQUESTS,
    });

    mockThrottlerToggle.deactivateThrottler();
  });

  afterAll(async () => {
    await app.close();
  });
});
