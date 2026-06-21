import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_BlogsTestHelper } from '../../utils/SA_BlogsTestHelper';
import { SA_PostsTestHelper } from '../../utils/SA_PostsTestHelper';
import { UsersTestHelper } from '../../utils/UsersTestHelper';
import { AuthTestHelper } from '../../utils/AuthTestHelper';
import {
  HttpLikeStatusDto,
  LikeStatus,
} from '../../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';
import { faker } from '@faker-js/faker';
import { TViewNewestLike } from '../../../src/modules/bloggers-platform/posts/domain/Post.entity';
import { MockThrottlerToggle } from '../../utils/MockThrottlerToggle';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Public_PostsTestHelper } from '../../utils/Public_PostsTestHelper';
import { HttpLoginDto } from '../../../src/modules/user-accounts/auth/api/dto/HttpLogin.dto';

describe('like post', () => {
  let app: INestApplication;

  let sa_blogsTestHelper: SA_BlogsTestHelper;
  let sa_postsTestHelper: SA_PostsTestHelper;
  let public_postsTestHelper: Public_PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;

  let mockThrottlerToggle: MockThrottlerToggle;

  const inputLike = { likeStatus: LikeStatus.Like };
  const inputDislike = { likeStatus: LikeStatus.Dislike };
  const inputNone = { likeStatus: LikeStatus.None };
  const inputWrongStatus = {
    likeStatus: 'Wrong status',
  } as unknown as HttpLikeStatusDto;

  const expectedNewestLike: TViewNewestLike = {
    userId: expect.any(String),
    login: expect.any(String),
    addedAt: expect.any(String),
  };

  let postId: string;
  let accessToken1: string;
  let accessToken2: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    sa_blogsTestHelper = new SA_BlogsTestHelper(app);
    sa_postsTestHelper = new SA_PostsTestHelper(app);
    public_postsTestHelper = new Public_PostsTestHelper(app);
    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);

    const throttlerGuard = app.get(ThrottlerGuard);
    mockThrottlerToggle = new MockThrottlerToggle(throttlerGuard, jest);
    mockThrottlerToggle.deactivateThrottler();

    const blog = await sa_blogsTestHelper.createRandomBlog();
    const post = await sa_postsTestHelper.createRandomPost(blog.id);
    postId = post.id;

    accessToken1 = await authTestHelper.createUserAndGetAccessToken();
    accessToken2 = await authTestHelper.createUserAndGetAccessToken();
  });

  afterAll(async () => {
    mockThrottlerToggle.activateThrottler();
    await app.close();
  });

  it('should add like to post return NO CONTENT status if data is valid, post exist, access token valid', async () => {
    await public_postsTestHelper.setLikeStatus(postId, inputLike, {
      accessToken: accessToken1,
    });
    const postAfterLikeResponse = await public_postsTestHelper.getPost(postId, {
      accessToken: accessToken1,
    });
    expect(postAfterLikeResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postAfterLikeResponse.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(postAfterLikeResponse.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Like,
    );
    expect(postAfterLikeResponse.body.extendedLikesInfo.newestLikes).toEqual([
      expectedNewestLike,
    ]);
  });

  it(`myStatus should be ${LikeStatus.None} if like was added by another user`, async () => {
    const getResponseForAnotherUser = await public_postsTestHelper.getPost(
      postId,
      {
        accessToken: accessToken2,
      },
    );
    expect(getResponseForAnotherUser.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.None,
    );
    expect(getResponseForAnotherUser.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it(`myStatus should be ${LikeStatus.None} if get request was sent from anonymous user`, async () => {
    const postResponse = await public_postsTestHelper.getPost(postId);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it('should change status', async () => {
    await public_postsTestHelper.setLikeStatus(postId, inputDislike, {
      accessToken: accessToken1,
    });

    const postAfterDislike = await public_postsTestHelper.getPost(postId, {
      accessToken: accessToken1,
    });
    expect(postAfterDislike.body.extendedLikesInfo.likesCount).toBe(0);
    expect(postAfterDislike.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postAfterDislike.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    await public_postsTestHelper.setLikeStatus(postId, inputNone, {
      accessToken: accessToken1,
    });

    const postAfterNone = await public_postsTestHelper.getPost(postId, {
      accessToken: accessToken1,
    });
    expect(postAfterNone.body.extendedLikesInfo.likesCount).toBe(0);
    expect(postAfterNone.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(postAfterNone.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
  });

  it('should track multiple users reactions independently', async () => {
    const blog = await sa_blogsTestHelper.createRandomBlog();
    const post = await sa_postsTestHelper.createRandomPost(blog.id);

    await public_postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken1,
    });

    await public_postsTestHelper.setLikeStatus(post.id, inputDislike, {
      accessToken: accessToken2,
    });

    let postResponse = await public_postsTestHelper.getPost(post.id, {
      accessToken: accessToken1,
    });
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);

    postResponse = await public_postsTestHelper.getPost(post.id, {
      accessToken: accessToken2,
    });
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    postResponse = await public_postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
  });

  it('should correctly count likes when user removes reaction', async () => {
    const blog = await sa_blogsTestHelper.createRandomBlog();
    const post = await sa_postsTestHelper.createRandomPost(blog.id);

    await public_postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken1,
    });

    await public_postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken2,
    });

    let postResponse = await public_postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(2);

    await public_postsTestHelper.setLikeStatus(post.id, inputNone, {
      accessToken: accessToken1,
    });

    postResponse = await public_postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it(`shouldn't set like to post. Return UNAUTHORIZED status if passed invalid access token`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await public_postsTestHelper.setLikeStatus(postId, inputLike, {
      accessToken: invalidAccessToken,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't set wrong status to post. Return BAD REQUEST status`, async () => {
    await public_postsTestHelper.setLikeStatus(postId, inputWrongStatus, {
      accessToken: accessToken1,
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it(`shouldn't set like to post. Return NOT FOUND status if post not exist`, async () => {
    const notExistPostId = crypto.randomUUID();
    await public_postsTestHelper.setLikeStatus(notExistPostId, inputLike, {
      accessToken: accessToken1,
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('should isolate reactions between different posts', async () => {
    const blog = await sa_blogsTestHelper.createRandomBlog();
    const post1 = await sa_postsTestHelper.createRandomPost(blog.id);
    const post2 = await sa_postsTestHelper.createRandomPost(blog.id);

    await public_postsTestHelper.setLikeStatus(post1.id, inputLike, {
      accessToken: accessToken1,
    });
    await public_postsTestHelper.setLikeStatus(post2.id, inputDislike, {
      accessToken: accessToken1,
    });

    await public_postsTestHelper.setLikeStatus(post1.id, inputDislike, {
      accessToken: accessToken2,
    });
    await public_postsTestHelper.setLikeStatus(post2.id, inputLike, {
      accessToken: accessToken2,
    });

    const post1Response = await public_postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(1);
    expect(post1Response.body.extendedLikesInfo.dislikesCount).toBe(1);

    const post2Response = await public_postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(1);
    expect(post2Response.body.extendedLikesInfo.dislikesCount).toBe(1);

    const post1User1Response = await public_postsTestHelper.getPost(post1.id, {
      accessToken: accessToken1,
    });
    expect(post1User1Response.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Like,
    );

    const post2User1Response = await public_postsTestHelper.getPost(post2.id, {
      accessToken: accessToken1,
    });
    expect(post2User1Response.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    const post1User2Response = await public_postsTestHelper.getPost(post1.id, {
      accessToken: accessToken2,
    });
    expect(post1User2Response.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    const post2User2Response = await public_postsTestHelper.getPost(post2.id, {
      accessToken: accessToken2,
    });
    expect(post2User2Response.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Like,
    );
  });

  it('should handle complex reactions scenario with multiple posts and users', async () => {
    const blog = await sa_blogsTestHelper.createRandomBlog();
    const post1 = await sa_postsTestHelper.createRandomPost(blog.id);
    const post2 = await sa_postsTestHelper.createRandomPost(blog.id);
    const post3 = await sa_postsTestHelper.createRandomPost(blog.id);

    const accessToken3 = await authTestHelper.createUserAndGetAccessToken();

    await public_postsTestHelper.setLikeStatus(post1.id, inputLike, {
      accessToken: accessToken1,
    });
    await public_postsTestHelper.setLikeStatus(post1.id, inputLike, {
      accessToken: accessToken2,
    });
    await public_postsTestHelper.setLikeStatus(post1.id, inputDislike, {
      accessToken: accessToken3,
    });

    await public_postsTestHelper.setLikeStatus(post2.id, inputDislike, {
      accessToken: accessToken1,
    });
    await public_postsTestHelper.setLikeStatus(post2.id, inputDislike, {
      accessToken: accessToken2,
    });

    await public_postsTestHelper.setLikeStatus(post3.id, inputLike, {
      accessToken: accessToken1,
    });
    await public_postsTestHelper.setLikeStatus(post3.id, inputLike, {
      accessToken: accessToken3,
    });

    const post1Response = await public_postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(2);
    expect(post1Response.body.extendedLikesInfo.dislikesCount).toBe(1);

    const post2Response = await public_postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(0);
    expect(post2Response.body.extendedLikesInfo.dislikesCount).toBe(2);

    const post3Response = await public_postsTestHelper.getPost(post3.id);
    expect(post3Response.body.extendedLikesInfo.likesCount).toBe(2);
    expect(post3Response.body.extendedLikesInfo.dislikesCount).toBe(0);

    const post1User1 = await public_postsTestHelper.getPost(post1.id, {
      accessToken: accessToken1,
    });
    expect(post1User1.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);

    const post2User1 = await public_postsTestHelper.getPost(post2.id, {
      accessToken: accessToken1,
    });
    expect(post2User1.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike);

    const post3User1 = await public_postsTestHelper.getPost(post3.id, {
      accessToken: accessToken1,
    });
    expect(post3User1.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);
  });

  it('should handle changing reactions across multiple posts', async () => {
    const blog = await sa_blogsTestHelper.createRandomBlog();
    const post1 = await sa_postsTestHelper.createRandomPost(blog.id);
    const post2 = await sa_postsTestHelper.createRandomPost(blog.id);

    await public_postsTestHelper.setLikeStatus(post1.id, inputLike, {
      accessToken: accessToken1,
    });
    await public_postsTestHelper.setLikeStatus(post2.id, inputLike, {
      accessToken: accessToken1,
    });

    let post1Response = await public_postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(1);
    let post2Response = await public_postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(1);

    await public_postsTestHelper.setLikeStatus(post1.id, inputDislike, {
      accessToken: accessToken1,
    });

    post1Response = await public_postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(0);

    post2Response = await public_postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(1);
    expect(post2Response.body.extendedLikesInfo.dislikesCount).toBe(0);

    await public_postsTestHelper.setLikeStatus(post1.id, inputNone, {
      accessToken: accessToken1,
    });

    post1Response = await public_postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(0);
    expect(post1Response.body.extendedLikesInfo.dislikesCount).toBe(0);

    post2Response = await public_postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it('should correctly accumulate likes and dislikes across posts for each user', async () => {
    const blog = await sa_blogsTestHelper.createRandomBlog();
    const posts = await sa_postsTestHelper.createRandomPosts(blog.id, 3);

    for (const post of posts) {
      await public_postsTestHelper.setLikeStatus(post.id, inputLike, {
        accessToken: accessToken1,
      });
    }

    for (const post of posts) {
      await public_postsTestHelper.setLikeStatus(post.id, inputDislike, {
        accessToken: accessToken2,
      });
    }

    for (const post of posts) {
      const postResponse = await public_postsTestHelper.getPost(post.id);
      expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
      expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);

      const user1Response = await public_postsTestHelper.getPost(post.id, {
        accessToken: accessToken1,
      });
      expect(user1Response.body.extendedLikesInfo.myStatus).toBe(
        LikeStatus.Like,
      );

      const user2Response = await public_postsTestHelper.getPost(post.id, {
        accessToken: accessToken2,
      });
      expect(user2Response.body.extendedLikesInfo.myStatus).toBe(
        LikeStatus.Dislike,
      );
    }
  });

  it('should display only newest 3 likes and preserve order when user removes and re-adds like', async () => {
    const blog = await sa_blogsTestHelper.createRandomBlog();
    const post = await sa_postsTestHelper.createRandomPost(blog.id);

    const userDtos = [
      usersTestHelper.createInputDto(),
      usersTestHelper.createInputDto(),
      usersTestHelper.createInputDto(),
      usersTestHelper.createInputDto(),
      usersTestHelper.createInputDto(),
    ];

    const userLogins = userDtos.map((dto) => dto.login);
    const accessTokens: string[] = [];

    for (const userDto of userDtos) {
      await usersTestHelper.createUser(userDto);
      const token = await authTestHelper.loginAndGetAccessToken({
        loginOrEmail: userDto.email,
        password: userDto.password,
      });
      accessTokens.push(token);
    }

    for (const token of accessTokens) {
      await public_postsTestHelper.setLikeStatus(post.id, inputLike, {
        accessToken: token,
      });
    }

    let postResponse = await public_postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(5);
    expect(postResponse.body.extendedLikesInfo.newestLikes).toHaveLength(3);

    const newestLikesLogins =
      postResponse.body.extendedLikesInfo.newestLikes.map(
        (like: TViewNewestLike) => like.login,
      );

    expect(newestLikesLogins[0]).toBe(userLogins[4]);
    expect(newestLikesLogins[1]).toBe(userLogins[3]);
    expect(newestLikesLogins[2]).toBe(userLogins[2]);

    expect(newestLikesLogins[3]).not.toBe(userLogins[1]);
    expect(newestLikesLogins[4]).not.toBe(userLogins[0]);

    await public_postsTestHelper.setLikeStatus(post.id, inputNone, {
      accessToken: accessTokens[0],
    });

    postResponse = await public_postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(4);

    await public_postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessTokens[0],
    });

    postResponse = await public_postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(5);

    expect(postResponse.body.extendedLikesInfo.newestLikes).toHaveLength(3);

    const updatedNewestLikesLogins =
      postResponse.body.extendedLikesInfo.newestLikes.map(
        (like: TViewNewestLike) => like.login,
      );

    expect(updatedNewestLikesLogins).not.toEqual(
      expect.arrayContaining([accessTokens[0]]),
    );
  });

  it('newest likes includes only "Like" reactions', async () => {
    const blog = await sa_blogsTestHelper.createRandomBlog();
    const post = await sa_postsTestHelper.createRandomPost(blog.id);

    const accessToken1 = await authTestHelper.createUserAndGetAccessToken();
    const accessToken2 = await authTestHelper.createUserAndGetAccessToken();
    const accessToken3 = await authTestHelper.createUserAndGetAccessToken();

    await public_postsTestHelper.setLikeStatus(post.id, inputDislike, {
      accessToken: accessToken1,
    });
    await public_postsTestHelper.setLikeStatus(post.id, inputDislike, {
      accessToken: accessToken2,
    });
    await public_postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken3,
    });

    const postAfterReactions = await public_postsTestHelper.getPost(post.id);

    expect(postAfterReactions.body.extendedLikesInfo.dislikesCount).toBe(2);
    expect(postAfterReactions.body.extendedLikesInfo.likesCount).toBe(1);
    expect(
      postAfterReactions.body.extendedLikesInfo.newestLikes,
    ).toBeInstanceOf(Array);
    expect(postAfterReactions.body.extendedLikesInfo.newestLikes).toHaveLength(
      1,
    );
  });

  it('should return paginated posts with correct likes', async () => {
    await cleanDatabase(app);
    const blog = await sa_blogsTestHelper.createRandomBlog();
    const posts = await sa_postsTestHelper.createRandomPosts(blog.id, 6);

    const postId1 = posts[0].id;
    const postId2 = posts[1].id;
    const postId3 = posts[2].id;
    const postId4 = posts[3].id;
    const postId5 = posts[4].id;
    const postId6 = posts[5].id;

    const user1InputDto = usersTestHelper.createInputDto();
    const user2InputDto = usersTestHelper.createInputDto();
    const user3InputDto = usersTestHelper.createInputDto();
    const user4InputDto = usersTestHelper.createInputDto();

    const user1 = (await usersTestHelper.createUser(user1InputDto)).body;
    const user2 = (await usersTestHelper.createUser(user2InputDto)).body;
    const user3 = (await usersTestHelper.createUser(user3InputDto)).body;
    const user4 = (await usersTestHelper.createUser(user4InputDto)).body;

    const user1LoginDto: HttpLoginDto = {
      loginOrEmail: user1InputDto.email,
      password: user1InputDto.password,
    };

    const user2LoginDto: HttpLoginDto = {
      loginOrEmail: user2InputDto.email,
      password: user2InputDto.password,
    };

    const user3LoginDto: HttpLoginDto = {
      loginOrEmail: user3InputDto.email,
      password: user3InputDto.password,
    };

    const user4LoginDto: HttpLoginDto = {
      loginOrEmail: user4InputDto.email,
      password: user4InputDto.password,
    };

    const accessToken1 =
      await authTestHelper.loginAndGetAccessToken(user1LoginDto);
    const accessToken2 =
      await authTestHelper.loginAndGetAccessToken(user2LoginDto);
    const accessToken3 =
      await authTestHelper.loginAndGetAccessToken(user3LoginDto);
    const accessToken4 =
      await authTestHelper.loginAndGetAccessToken(user4LoginDto);

    await public_postsTestHelper.setLikeStatus(postId1, inputLike, {
      accessToken: accessToken1,
    });
    await public_postsTestHelper.setLikeStatus(postId1, inputLike, {
      accessToken: accessToken2,
    });

    await public_postsTestHelper.setLikeStatus(postId2, inputLike, {
      accessToken: accessToken2,
    });
    await public_postsTestHelper.setLikeStatus(postId2, inputLike, {
      accessToken: accessToken3,
    });

    await public_postsTestHelper.setLikeStatus(postId3, inputDislike, {
      accessToken: accessToken1,
    });

    await public_postsTestHelper.setLikeStatus(postId4, inputLike, {
      accessToken: accessToken1,
    });
    await public_postsTestHelper.setLikeStatus(postId4, inputLike, {
      accessToken: accessToken4,
    });
    await public_postsTestHelper.setLikeStatus(postId4, inputLike, {
      accessToken: accessToken2,
    });
    await public_postsTestHelper.setLikeStatus(postId4, inputLike, {
      accessToken: accessToken3,
    });

    await public_postsTestHelper.setLikeStatus(postId5, inputLike, {
      accessToken: accessToken2,
    });
    await public_postsTestHelper.setLikeStatus(postId5, inputDislike, {
      accessToken: accessToken3,
    });

    await public_postsTestHelper.setLikeStatus(postId6, inputLike, {
      accessToken: accessToken1,
    });
    await public_postsTestHelper.setLikeStatus(postId6, inputDislike, {
      accessToken: accessToken2,
    });

    const postsAfterReactionsForUser1 = await public_postsTestHelper.getPosts({
      accessToken: accessToken1,
    });

    const body = postsAfterReactionsForUser1.body;

    expect(body.totalCount).toBe(6);

    const expectedPost1 = public_postsTestHelper.createExpectedPost({
      id: postId1,
      extendedLikesInfo: {
        likesCount: 2,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            login: user2.login,
            userId: user2.id,
            addedAt: expect.any(String),
          },
          {
            login: user1.login,
            userId: user1.id,
            addedAt: expect.any(String),
          },
        ],
      },
    });
    expect(body.items[5]).toEqual(expectedPost1);

    const expectedPost2 = public_postsTestHelper.createExpectedPost({
      id: postId2,
      extendedLikesInfo: {
        likesCount: 2,
        dislikesCount: 0,
        myStatus: LikeStatus.None,
        newestLikes: [
          {
            login: user3.login,
            userId: user3.id,
            addedAt: expect.any(String),
          },
          {
            login: user2.login,
            userId: user2.id,
            addedAt: expect.any(String),
          },
        ],
      },
    });
    expect(body.items[4]).toEqual(expectedPost2);

    const expectedPost3 = public_postsTestHelper.createExpectedPost({
      id: postId3,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 1,
        myStatus: LikeStatus.Dislike,
        newestLikes: [],
      },
    });

    expect(body.items[3]).toEqual(expectedPost3);

    const expectedPost4 = public_postsTestHelper.createExpectedPost({
      id: postId4,
      extendedLikesInfo: {
        likesCount: 4,
        dislikesCount: 0,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            login: user3.login,
            userId: user3.id,
            addedAt: expect.any(String),
          },
          {
            login: user2.login,
            userId: user2.id,
            addedAt: expect.any(String),
          },
          {
            login: user4.login,
            userId: user4.id,
            addedAt: expect.any(String),
          },
        ],
      },
    });
    expect(body.items[2]).toEqual(expectedPost4);

    const expectedPost5 = public_postsTestHelper.createExpectedPost({
      id: postId5,
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 1,
        myStatus: LikeStatus.None,
        newestLikes: [
          {
            login: user2.login,
            userId: user2.id,
            addedAt: expect.any(String),
          },
        ],
      },
    });
    expect(body.items[1]).toEqual(expectedPost5);

    const expectedPost6 = public_postsTestHelper.createExpectedPost({
      id: postId6,
      extendedLikesInfo: {
        likesCount: 1,
        dislikesCount: 1,
        myStatus: LikeStatus.Like,
        newestLikes: [
          {
            login: user1.login,
            userId: user1.id,
            addedAt: expect.any(String),
          },
        ],
      },
    });
    expect(body.items[0]).toEqual(expectedPost6);
  });
});
