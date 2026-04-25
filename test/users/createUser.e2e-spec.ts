import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { HttpCreateUserDto } from '../../src/modules/user-accounts/users/api/dto/HttpCreateUser.dto';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { ApiErrorResultDto } from '../../src/core/dto/ApiErrorResult.dto';

describe('create user', () => {
  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);
    usersTestHelper = new UsersTestHelper(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create and return user if data is valid and admin auth passed', async () => {
    const dto = usersTestHelper.createInputDto();
    const createUserResponse = await usersTestHelper.createUser(dto);

    const expectedUser = usersTestHelper.createExpectedUser({
      login: dto.login,
      email: dto.email,
    });

    expect(createUserResponse.body).toEqual(expectedUser);
  });

  it(`shouldn't create user if login is busy`, async () => {
    const user = await usersTestHelper.createRandomUser();
    const dto = usersTestHelper.createInputDto();
    const equalLogin: HttpCreateUserDto = {
      ...dto,
      login: user.login,
    };

    const createUserResponse =
      await usersTestHelper.createUser<ApiErrorResultDto>(equalLogin, {
        status: HttpStatus.BAD_REQUEST,
      });

    expect(createUserResponse.body.errorsMessages[0]).toEqual({
      field: 'login',
      message: expect.any(String),
    });
  });

  it(`shouldn't create user if email is busy`, async () => {
    const user = await usersTestHelper.createRandomUser();
    const dto = usersTestHelper.createInputDto();
    const equalEmail: HttpCreateUserDto = {
      ...dto,
      email: user.email,
    };

    const createUserResponse =
      await usersTestHelper.createUser<ApiErrorResultDto>(equalEmail, {
        status: HttpStatus.BAD_REQUEST,
      });

    expect(createUserResponse.body.errorsMessages[0]).toEqual({
      field: 'email',
      message: expect.any(String),
    });
  });

  it.each([
    {
      testDesc: 'login is empty string',
      inputUser: {
        login: '',
        email: 'user_2@mail.ru',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'login is not string',
      inputUser: {
        login: 10,
        email: 'user_2@mail.ru',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'login is not passed',
      inputUser: {
        email: 'user_2@mail.ru',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'email is empty string',
      inputUser: {
        login: 'User_02',
        email: '',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'email has incorrect format',
      inputUser: {
        login: 'User_02',
        email: 'usermail.ru',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'email is not passed',
      inputUser: {
        login: 'User_02',
        password: 'strong_password',
      },
    },
    {
      testDesc: 'password is empty string',
      inputUser: {
        login: 'User_03',
        email: 'user_3@mail.ru',
        password: '',
      },
    },
    {
      testDesc: 'password is not string',
      inputUser: {
        login: 'User_03',
        email: 'user_3@mail.ru',
        password: 1223456,
      },
    },
    {
      testDesc: 'password is not passed',
      inputUser: {
        login: 'User_03',
        email: 'user_3@mail.ru',
      },
    },
  ])(`shouldn't create user if $testDesc`, async ({ inputUser }) => {
    {
      await usersTestHelper.createUser(inputUser as HttpCreateUserDto, {
        status: HttpStatus.BAD_REQUEST,
      });
    }
  });

  it(`shouldn't create user if not admin auth`, async () => {
    const dto = usersTestHelper.createInputDto();
    await usersTestHelper.createUser(dto, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
