import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { confirmRegistration } from '../utils/confirmRegistration';
import { AuthTestHelper } from '../utils/AuthTestHelper';

describe('registration-confirmation', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;
  let mockSendConfirmationCode: jest.SpyInstance;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
    authTestHelper = new AuthTestHelper(app);
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
    const inputUser = {
      login: 'User_01',
      email: 'user1@mail.ru',
      password: 'strong_password',
    };

    await authTestHelper.registerUser(inputUser);

    const confirmationCode = mockSendConfirmationCode.mock.calls[0][1];

    const confirmRegistrationResponse = await confirmRegistration(
      app,
      confirmationCode,
    );

    expect(confirmRegistrationResponse.status).toBe(HttpStatus.NO_CONTENT);
  });

  it('should return bad request if user already confirmed', async () => {
    const inputUser = {
      login: 'User_02',
      email: 'user2@mail.ru',
      password: 'strong_password',
    };

    await authTestHelper.registerUser(inputUser);

    const confirmationCode = mockSendConfirmationCode.mock.calls[0][1];

    const confirmRegistrationResponse1 = await confirmRegistration(
      app,
      confirmationCode,
    );

    expect(confirmRegistrationResponse1.status).toBe(HttpStatus.NO_CONTENT);

    const confirmRegistrationResponse2 = await confirmRegistration(
      app,
      confirmationCode,
    );

    expect(confirmRegistrationResponse2.status).toBe(HttpStatus.BAD_REQUEST);
  });

  it('should return bad request if confirmation code is incorrect', async () => {
    const confirmRegistrationResponse = await confirmRegistration(
      app,
      'incorrect code',
    );

    expect(confirmRegistrationResponse.status).toBe(HttpStatus.BAD_REQUEST);
  });

  afterAll(async () => {
    await app.close();
  });
});
