import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { registerUser } from '../utils/registerUser';
import { confirmRegistration } from '../utils/confirmRegistration';
import request from 'supertest';

describe('registration-confirmation', () => {
  const inputUser = {
    login: 'User_01',
    email: 'user1@mail.ru',
    password: 'strong_password',
  };

  let app: INestApplication;
  let mockSendConfirmationCode: jest.SpyInstance;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
    await registerUser(app, inputUser);

    mockSendConfirmationCode = jest.spyOn(
      fakeEmailService,
      'sendConfirmationCode',
    );
  });

  afterAll(async () => {
    mockSendConfirmationCode.mockRestore();
    await app.close();
  });

  afterEach(() => {
    mockSendConfirmationCode.mockClear();
  });

  it('should send confirmation code if email exist and unconfirmed', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({ email: inputUser.email })
      .expect(HttpStatus.NO_CONTENT);

    const emailRecipient = mockSendConfirmationCode.mock.calls[0][0];

    expect(mockSendConfirmationCode).toHaveBeenCalledTimes(1);
    expect(emailRecipient).toBe(inputUser.email);
  });

  it('should return BAD REQUEST status if email already confirmed', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({ email: inputUser.email })
      .expect(HttpStatus.NO_CONTENT);

    const confirmationCode = mockSendConfirmationCode.mock.calls[0][1];
    await confirmRegistration(app, confirmationCode);

    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({ email: inputUser.email })
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('should return BAD REQUEST status if email not existed', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-email-resending')
      .send({ email: 'notexisted@mail.ru' })
      .expect(HttpStatus.BAD_REQUEST);

    expect(mockSendConfirmationCode).not.toHaveBeenCalled();
  });
});
