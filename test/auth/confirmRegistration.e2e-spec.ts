import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';

const registerUser = async (
  app: INestApplication,
  inputCreateUserDto: InputCreateUserDto,
): Promise<Response> => {
  return await request(app.getHttpServer())
    .post('/auth/registration')
    .send(inputCreateUserDto)
    .expect(HttpStatus.CREATED);
};

const confirmRegistration = async (
  app: INestApplication,
  code: string,
): Promise<Response> => {
  return await request(app.getHttpServer())
    .post('/auth/registration-confirmation')
    .send({ code });
};

describe('registration-confirmation', () => {
  let app: INestApplication;
  let mockSendConfirmationCode: jest.SpyInstance;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
  });

  beforeEach(() => {
    mockSendConfirmationCode = jest.spyOn(
      fakeEmailService,
      'sendConfirmationCode',
    );
  });

  afterEach(() => {
    mockSendConfirmationCode.mockReset();
  });

  it('should confirm registration', async () => {
    const inputUser = {
      login: 'User_01',
      email: 'user1@mail.ru',
      password: 'strong_password',
    };

    await registerUser(app, inputUser);

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

    await registerUser(app, inputUser);

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
