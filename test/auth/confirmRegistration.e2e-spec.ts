import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';

describe('registration-confirmation', () => {
  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let mockSendConfirmationCode: jest.SpyInstance;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);
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
    await authTestHelper.confirmRegistration(confirmationCode);
  });

  it('should return bad request if user already confirmed', async () => {
    const inputUser = usersTestHelper.createInputDto();
    await authTestHelper.registerUser(inputUser);
    const confirmationCode = mockSendConfirmationCode.mock.calls[0][1];

    await authTestHelper.confirmRegistration(confirmationCode);

    await authTestHelper.confirmRegistration(confirmationCode, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return bad request if confirmation code is incorrect', async () => {
    await authTestHelper.confirmRegistration('incorrect code', {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
