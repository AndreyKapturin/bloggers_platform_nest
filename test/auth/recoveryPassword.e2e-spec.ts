import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { InputCreateUserDto } from '../../src/modules/user-accounts/users/dto/CreateUser.input-dto';
import { registerUser } from '../utils/registerUser';
import { InputNewPasswordDto } from '../../src/modules/user-accounts/auth/dto/NewPassword.input-dto';
import { InputLoginDto } from '../../src/modules/user-accounts/auth/dto/Login.input-dto';

describe('recovery password', () => {
  let app: INestApplication;
  let mockSendRecoveryCode: jest.SpyInstance;

  const inputUser: InputCreateUserDto = {
    login: 'User_01',
    email: 'user1@mail.ru',
    password: 'Strong_password',
  };

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
    await registerUser(app, inputUser);
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

  it('should successfully recovery password', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({ email: inputUser.email })
      .expect(HttpStatus.NO_CONTENT);

    const recoveryCode = mockSendRecoveryCode.mock.calls[0][1];

    const inputNewPassword: InputNewPasswordDto = {
      newPassword: 'New_strong_password',
      recoveryCode,
    };

    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send(inputNewPassword)
      .expect(HttpStatus.NO_CONTENT);

    const inputLoginViaOldPassword: InputLoginDto = {
      loginOrEmail: inputUser.login,
      password: inputUser.password,
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(inputLoginViaOldPassword)
      .expect(HttpStatus.UNAUTHORIZED);

    const inputLoginViaNewPassword: InputLoginDto = {
      loginOrEmail: inputUser.login,
      password: inputNewPassword.newPassword,
    };

    await request(app.getHttpServer())
      .post('/auth/login')
      .send(inputLoginViaNewPassword)
      .expect(HttpStatus.OK);
  });

  it('should return NO CONTENT status if user not exist', async () => {
    await request(app.getHttpServer())
      .post('/auth/password-recovery')
      .send({ email: 'not_exist@mail.ru' })
      .expect(HttpStatus.NO_CONTENT);

    expect(mockSendRecoveryCode).not.toHaveBeenCalled();
  });

  it('should return BAD REQUEST status if recovery code is incorrect', async () => {
    const inputNewPassword: InputNewPasswordDto = {
      newPassword: 'New_strong_password',
      recoveryCode: 'not existed code',
    };

    await request(app.getHttpServer())
      .post('/auth/new-password')
      .send(inputNewPassword)
      .expect(HttpStatus.BAD_REQUEST);
  });
});
