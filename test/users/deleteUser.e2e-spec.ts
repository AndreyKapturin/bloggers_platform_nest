import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { ViewUserDto } from '../../src/modules/user-accounts/users/api/dto/ViewUser.dto';
import { faker } from '@faker-js/faker';

describe('delete user', () => {
  let app: INestApplication;
  let usersTestHelper: UsersTestHelper;
  let user: ViewUserDto;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    usersTestHelper = new UsersTestHelper(app);
    user = await usersTestHelper.createRandomUser();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`shouldn't delete user. Return UNAUTHORIZED if not admin auth`, async () => {
    await usersTestHelper.deleteUser(user.id, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't delete user. Return NOT FOUND if user not exist`, async () => {
    const unexistedUserId = faker.database.mongodbObjectId().toString();
    await usersTestHelper.deleteUser(unexistedUserId, {
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('should delete user if exist and admin auth passed', async () => {
    await usersTestHelper.deleteUser(user.id);
  });
});
