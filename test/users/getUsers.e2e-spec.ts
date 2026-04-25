import { INestApplication, HttpStatus } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import {
  DEFAULT_PAGE_SIZE,
  SortDirection,
} from '../../src/core/dto/BaseQueryParams.dto';
import { UsersSortBy } from '../../src/modules/user-accounts/users/api/dto/UserQueryParams.dto';

describe('get users', () => {
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

  it('should return all users with pagination info', async () => {
    const totalUsersCount = 5;
    const users = await usersTestHelper.createRandomUsers(totalUsersCount);
    const response = await usersTestHelper.getUsers();
    const expectedBody = usersTestHelper.createExpectedPaginatedUser({
      page: 1,
      pagesCount: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: totalUsersCount,
      items: expect.arrayContaining(users),
    });
    expect(response.body).toEqual(expectedBody);
  });

  it('should filter users by searchLoginTerm', async () => {
    const user = await usersTestHelper.createRandomUser();
    await usersTestHelper.createRandomUser();

    const response = await usersTestHelper.getUsers({
      filter: { searchLoginTerm: user.login },
    });

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].login).toBe(user.login);
    expect(response.body.totalCount).toBe(1);
  });

  it('should filter users by searchEmailTerm', async () => {
    const user = await usersTestHelper.createRandomUser();
    await usersTestHelper.createRandomUser();

    const response = await usersTestHelper.getUsers({
      filter: { searchEmailTerm: user.email },
    });

    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].email).toBe(user.email);
    expect(response.body.totalCount).toBe(1);
  });

  it('should combine filter users by searchEmailTerm and searchLoginTerm', async () => {
    await cleanDatabase(app);
    const targetEmailUser = await usersTestHelper.createRandomUser();
    const targetLoginUser = await usersTestHelper.createRandomUser();
    await usersTestHelper.createRandomUsers(8);
    await usersTestHelper.createRandomUser();

    const response = await usersTestHelper.getUsers({
      filter: {
        searchEmailTerm: targetEmailUser.email,
        searchLoginTerm: targetLoginUser.login,
      },
    });

    const expectedBody = usersTestHelper.createExpectedPaginatedUser({
      page: 1,
      pagesCount: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: 2,
      items: expect.arrayContaining([targetEmailUser, targetLoginUser]),
    });

    expect(response.body).toEqual(expectedBody);
  });

  it('should support pagination with pageNumber and pageSize', async () => {
    await cleanDatabase(app);
    const totalUsersCount = 25;
    await usersTestHelper.createRandomUsers(totalUsersCount);
    let pageNumber = 1;
    let pageSize = 10;

    const firstPageResponse = await usersTestHelper.getUsers({
      filter: { pageNumber, pageSize },
    });

    const expectedFirstPage = usersTestHelper.createExpectedPaginatedUser({
      page: pageNumber,
      pageSize,
      pagesCount: Math.ceil(totalUsersCount / pageSize),
      totalCount: totalUsersCount,
    });

    expect(firstPageResponse.body).toEqual(expectedFirstPage);

    pageNumber = 2;

    const secondPageResponse = await usersTestHelper.getUsers({
      filter: { pageNumber, pageSize },
    });

    const expectedSecondPage = usersTestHelper.createExpectedPaginatedUser({
      page: pageNumber,
      pageSize,
      pagesCount: Math.ceil(totalUsersCount / pageSize),
      totalCount: totalUsersCount,
    });

    expect(secondPageResponse.body).toEqual(expectedSecondPage);
  });

  it('should sort users by createdAt in desc/asc order', async () => {
    await cleanDatabase(app);
    const users = await usersTestHelper.createRandomUsers(3);

    const getDecsOrderResponse = await usersTestHelper.getUsers({
      filter: {
        sortBy: UsersSortBy.CreatedAt,
        sortDirection: SortDirection.Desc,
      },
    });

    expect(getDecsOrderResponse.body.items[0].id).toBe(users[2].id);
    expect(getDecsOrderResponse.body.items[1].id).toBe(users[1].id);
    expect(getDecsOrderResponse.body.items[2].id).toBe(users[0].id);

    const getAscOrderResponse = await usersTestHelper.getUsers({
      filter: {
        sortBy: UsersSortBy.CreatedAt,
        sortDirection: SortDirection.Asc,
      },
    });

    expect(getAscOrderResponse.body.items[0].id).toBe(users[0].id);
    expect(getAscOrderResponse.body.items[1].id).toBe(users[1].id);
    expect(getAscOrderResponse.body.items[2].id).toBe(users[2].id);
  });

  it('should sort users by login in desc/asc order', async () => {
    await cleanDatabase(app);
    const users = await usersTestHelper.createRandomUsers(3);
    const logins = users.map((u) => u.login);

    const descSortedResponse = await usersTestHelper.getUsers({
      filter: { sortBy: UsersSortBy.Login, sortDirection: SortDirection.Desc },
    });

    const localDescSortedLogins = [...logins].sort((a, b) => {
      if (a < b) return 1;
      if (a > b) return -1;
      return 0;
    });

    const responseDescSortedLogins = descSortedResponse.body.items.map(
      (u) => u.login,
    );
    expect(localDescSortedLogins).toEqual(responseDescSortedLogins);

    const ascSortedResponse = await usersTestHelper.getUsers({
      filter: { sortBy: UsersSortBy.Login, sortDirection: SortDirection.Asc },
    });

    const localAscSortedLogins = [...logins].sort((a, b) => {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    const responseAscSortedLogins = ascSortedResponse.body.items.map(
      (u) => u.login,
    );

    expect(localAscSortedLogins).toEqual(responseAscSortedLogins);
  });

  it('should combine search filter with pagination', async () => {
    await cleanDatabase(app);
    const targetUser = await usersTestHelper.createRandomUser();
    await usersTestHelper.createRandomUsers(10);

    const pageNumber = 1;
    const pageSize = 1;

    const response = await usersTestHelper.getUsers({
      filter: {
        searchLoginTerm: targetUser.login,
        pageNumber,
        pageSize,
      },
    });

    const expectedBody = usersTestHelper.createExpectedPaginatedUser({
      totalCount: 1,
      pagesCount: 1,
      page: pageNumber,
      pageSize,
      items: [targetUser],
    });

    expect(response.body).toEqual(expectedBody);
  });

  it('should return UNAUTHORIZED status if not admin auth', async () => {
    await usersTestHelper.getUsers({
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
