import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import request from 'supertest';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';

describe('registration-confirmation', () => {
  let app: INestApplication;

  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let mockSendConfirmationCode: jest.SpyInstance;

  let inputUser: InputCreateUserDto;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);

    inputUser = usersTestHelper.createInputDto();
    await authTestHelper.registerUser(inputUser);

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
    await authTestHelper.confirmRegistration(confirmationCode);

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
