import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { fakeEmailService } from '../utils/mocks/fakeEmailService';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { HttpEmailDto } from '../../src/modules/user-accounts/auth/api/dto/HttpEmail.dto';
import { HttpConfirmationCodeDto } from '../../src/modules/user-accounts/auth/api/dto/HttpConfirmationCode.dto';

describe('registration-confirmation', () => {
  let app: INestApplication;

  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;
  let mockSendConfirmationCode: jest.SpyInstance;

  let inputEmailDto: HttpEmailDto;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);

    const inputUser = usersTestHelper.createInputDto();
    await authTestHelper.registerUser(inputUser);

    inputEmailDto = { email: inputUser.email };

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
    await authTestHelper.resendConfirmationCode(inputEmailDto);

    const emailRecipient = mockSendConfirmationCode.mock.calls[0][0];
    const confirmationCode = mockSendConfirmationCode.mock.calls[0][1];

    expect(mockSendConfirmationCode).toHaveBeenCalledTimes(1);
    expect(emailRecipient).toBe(inputEmailDto.email);
    expect(confirmationCode).toEqual(expect.any(String));
  });

  it('should return BAD REQUEST status if email is empty string', async () => {
    const badEmailDto: HttpEmailDto = { email: '' };
    await authTestHelper.resendConfirmationCode(badEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if email is string of spaces', async () => {
    const badEmailDto: HttpEmailDto = { email: ' '.repeat(5) };
    await authTestHelper.resendConfirmationCode(badEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if email is not a string', async () => {
    const badEmailDto = { email: 101 } as unknown as HttpEmailDto;
    await authTestHelper.resendConfirmationCode(badEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if email is not passed', async () => {
    const badEmailDto = {} as unknown as HttpEmailDto;
    await authTestHelper.resendConfirmationCode(badEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if email already confirmed', async () => {
    await authTestHelper.resendConfirmationCode(inputEmailDto);

    const confirmationCode = mockSendConfirmationCode.mock.calls[0][1];
    const codeDto: HttpConfirmationCodeDto = { code: confirmationCode };
    await authTestHelper.confirmRegistration(codeDto);

    await authTestHelper.resendConfirmationCode(inputEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it('should return BAD REQUEST status if email not existed', async () => {
    const notExistedEmailDto: HttpEmailDto = { email: 'notexisted@mail.ru' };
    await authTestHelper.resendConfirmationCode(notExistedEmailDto, {
      status: HttpStatus.BAD_REQUEST,
    });
    expect(mockSendConfirmationCode).not.toHaveBeenCalled();
  });
});
