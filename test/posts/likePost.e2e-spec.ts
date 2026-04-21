import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../src/core/setupApp';
import { cleanDatabase } from '../utils/cleanDatabase';
import { initApp } from '../utils/initApp';
import { BlogsTestHelper } from '../utils/BlogsTestHelper';
import { PostsTestHelper } from '../utils/PostsTestHelper';
import { UsersTestHelper } from '../utils/UsersTestHelper';
import { AuthTestHelper } from '../utils/AuthTestHelper';
import {
  HttpLikeStatusDto,
  LikeStatus,
} from '../../src/modules/bloggers-platform/dto/HttpLikeStatus.dto';
import { faker } from '@faker-js/faker';
import { NewestLike } from '../../src/modules/bloggers-platform/posts/domain/Post.entity';

describe('like post', () => {
  let app: INestApplication;

  let blogsTestHelper: BlogsTestHelper;
  let postsTestHelper: PostsTestHelper;
  let usersTestHelper: UsersTestHelper;
  let authTestHelper: AuthTestHelper;

  const inputLike = { likeStatus: LikeStatus.Like };
  const inputDislike = { likeStatus: LikeStatus.Dislike };
  const inputNone = { likeStatus: LikeStatus.None };
  const inputWrongStatus = {
    likeStatus: 'Wrong status',
  } as unknown as HttpLikeStatusDto;

  const expectedNewestLike = {
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

    blogsTestHelper = new BlogsTestHelper(app);
    postsTestHelper = new PostsTestHelper(app);
    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);

    const blog = await blogsTestHelper.createRandomBlog();
    const post = await postsTestHelper.createRandomPost(blog.id);
    postId = post.id;

    accessToken1 = await authTestHelper.createUserAndGetAccessToken();
    accessToken2 = await authTestHelper.createUserAndGetAccessToken();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should add like to post return NO CONTENT status if data is valid, post exist, access token valid', async () => {
    await postsTestHelper.setLikeStatus(postId, inputLike, {
      accessToken: accessToken1,
    });
    const postAfterLikeResponse = await postsTestHelper.getPost(postId, {
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
    const getResponseForAnotherUser = await postsTestHelper.getPost(postId, {
      accessToken: accessToken2,
    });
    expect(getResponseForAnotherUser.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.None,
    );
    expect(getResponseForAnotherUser.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it(`myStatus should be ${LikeStatus.None} if get request was sent from anonymous user`, async () => {
    const postResponse = await postsTestHelper.getPost(postId);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it('should change status', async () => {
    await postsTestHelper.setLikeStatus(postId, inputDislike, {
      accessToken: accessToken1,
    });

    const postAfterDislike = await postsTestHelper.getPost(postId, {
      accessToken: accessToken1,
    });
    expect(postAfterDislike.body.extendedLikesInfo.likesCount).toBe(0);
    expect(postAfterDislike.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postAfterDislike.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    await postsTestHelper.setLikeStatus(postId, inputNone, {
      accessToken: accessToken1,
    });

    const postAfterNone = await postsTestHelper.getPost(postId, {
      accessToken: accessToken1,
    });
    expect(postAfterNone.body.extendedLikesInfo.likesCount).toBe(0);
    expect(postAfterNone.body.extendedLikesInfo.dislikesCount).toBe(0);
    expect(postAfterNone.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
  });

  it('should track multiple users reactions independently', async () => {
    const blog = await blogsTestHelper.createRandomBlog();
    const post = await postsTestHelper.createRandomPost(blog.id);

    await postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken1,
    });

    await postsTestHelper.setLikeStatus(post.id, inputDislike, {
      accessToken: accessToken2,
    });

    let postResponse = await postsTestHelper.getPost(post.id, {
      accessToken: accessToken1,
    });
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);

    postResponse = await postsTestHelper.getPost(post.id, {
      accessToken: accessToken2,
    });
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    postResponse = await postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(postResponse.body.extendedLikesInfo.myStatus).toBe(LikeStatus.None);
  });

  it('should correctly count likes when user removes reaction', async () => {
    const blog = await blogsTestHelper.createRandomBlog();
    const post = await postsTestHelper.createRandomPost(blog.id);

    await postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken1,
    });

    await postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessToken2,
    });

    let postResponse = await postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(2);

    await postsTestHelper.setLikeStatus(post.id, inputNone, {
      accessToken: accessToken1,
    });

    postResponse = await postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it(`shouldn't set like to post. Return UNAUTHORIZED status if passed invalid access token`, async () => {
    const invalidAccessToken = faker.internet.jwt();
    await postsTestHelper.setLikeStatus(postId, inputLike, {
      accessToken: invalidAccessToken,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't set wrong status to post. Return BAD REQUEST status`, async () => {
    await postsTestHelper.setLikeStatus(postId, inputWrongStatus, {
      accessToken: accessToken1,
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it(`shouldn't set like to post. Return NOT FOUND status if post not exist`, async () => {
    const notExistPostId = faker.database.mongodbObjectId().toString();
    await postsTestHelper.setLikeStatus(notExistPostId, inputLike, {
      accessToken: accessToken1,
      status: HttpStatus.NOT_FOUND,
    });
  });

  it('should isolate reactions between different posts', async () => {
    const blog = await blogsTestHelper.createRandomBlog();
    const post1 = await postsTestHelper.createRandomPost(blog.id);
    const post2 = await postsTestHelper.createRandomPost(blog.id);

    await postsTestHelper.setLikeStatus(post1.id, inputLike, {
      accessToken: accessToken1,
    });
    await postsTestHelper.setLikeStatus(post2.id, inputDislike, {
      accessToken: accessToken1,
    });

    await postsTestHelper.setLikeStatus(post1.id, inputDislike, {
      accessToken: accessToken2,
    });
    await postsTestHelper.setLikeStatus(post2.id, inputLike, {
      accessToken: accessToken2,
    });

    const post1Response = await postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(1);
    expect(post1Response.body.extendedLikesInfo.dislikesCount).toBe(1);

    const post2Response = await postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(1);
    expect(post2Response.body.extendedLikesInfo.dislikesCount).toBe(1);

    const post1User1Response = await postsTestHelper.getPost(post1.id, {
      accessToken: accessToken1,
    });
    expect(post1User1Response.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Like,
    );

    const post2User1Response = await postsTestHelper.getPost(post2.id, {
      accessToken: accessToken1,
    });
    expect(post2User1Response.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    const post1User2Response = await postsTestHelper.getPost(post1.id, {
      accessToken: accessToken2,
    });
    expect(post1User2Response.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Dislike,
    );

    const post2User2Response = await postsTestHelper.getPost(post2.id, {
      accessToken: accessToken2,
    });
    expect(post2User2Response.body.extendedLikesInfo.myStatus).toBe(
      LikeStatus.Like,
    );
  });

  it('should handle complex reactions scenario with multiple posts and users', async () => {
    const blog = await blogsTestHelper.createRandomBlog();
    const post1 = await postsTestHelper.createRandomPost(blog.id);
    const post2 = await postsTestHelper.createRandomPost(blog.id);
    const post3 = await postsTestHelper.createRandomPost(blog.id);

    const accessToken3 = await authTestHelper.createUserAndGetAccessToken();

    await postsTestHelper.setLikeStatus(post1.id, inputLike, {
      accessToken: accessToken1,
    });
    await postsTestHelper.setLikeStatus(post1.id, inputLike, {
      accessToken: accessToken2,
    });
    await postsTestHelper.setLikeStatus(post1.id, inputDislike, {
      accessToken: accessToken3,
    });

    await postsTestHelper.setLikeStatus(post2.id, inputDislike, {
      accessToken: accessToken1,
    });
    await postsTestHelper.setLikeStatus(post2.id, inputDislike, {
      accessToken: accessToken2,
    });

    await postsTestHelper.setLikeStatus(post3.id, inputLike, {
      accessToken: accessToken1,
    });
    await postsTestHelper.setLikeStatus(post3.id, inputLike, {
      accessToken: accessToken3,
    });

    const post1Response = await postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(2);
    expect(post1Response.body.extendedLikesInfo.dislikesCount).toBe(1);

    const post2Response = await postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(0);
    expect(post2Response.body.extendedLikesInfo.dislikesCount).toBe(2);

    const post3Response = await postsTestHelper.getPost(post3.id);
    expect(post3Response.body.extendedLikesInfo.likesCount).toBe(2);
    expect(post3Response.body.extendedLikesInfo.dislikesCount).toBe(0);

    const post1User1 = await postsTestHelper.getPost(post1.id, {
      accessToken: accessToken1,
    });
    expect(post1User1.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);

    const post2User1 = await postsTestHelper.getPost(post2.id, {
      accessToken: accessToken1,
    });
    expect(post2User1.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Dislike);

    const post3User1 = await postsTestHelper.getPost(post3.id, {
      accessToken: accessToken1,
    });
    expect(post3User1.body.extendedLikesInfo.myStatus).toBe(LikeStatus.Like);
  });

  it('should handle changing reactions across multiple posts', async () => {
    const blog = await blogsTestHelper.createRandomBlog();
    const post1 = await postsTestHelper.createRandomPost(blog.id);
    const post2 = await postsTestHelper.createRandomPost(blog.id);

    await postsTestHelper.setLikeStatus(post1.id, inputLike, {
      accessToken: accessToken1,
    });
    await postsTestHelper.setLikeStatus(post2.id, inputLike, {
      accessToken: accessToken1,
    });

    let post1Response = await postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(1);
    let post2Response = await postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(1);

    await postsTestHelper.setLikeStatus(post1.id, inputDislike, {
      accessToken: accessToken1,
    });

    post1Response = await postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.dislikesCount).toBe(1);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(0);

    post2Response = await postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(1);
    expect(post2Response.body.extendedLikesInfo.dislikesCount).toBe(0);

    await postsTestHelper.setLikeStatus(post1.id, inputNone, {
      accessToken: accessToken1,
    });

    post1Response = await postsTestHelper.getPost(post1.id);
    expect(post1Response.body.extendedLikesInfo.likesCount).toBe(0);
    expect(post1Response.body.extendedLikesInfo.dislikesCount).toBe(0);

    post2Response = await postsTestHelper.getPost(post2.id);
    expect(post2Response.body.extendedLikesInfo.likesCount).toBe(1);
  });

  it('should correctly accumulate likes and dislikes across posts for each user', async () => {
    const blog = await blogsTestHelper.createRandomBlog();
    const posts = await postsTestHelper.createRandomPosts(blog.id, 3);

    for (const post of posts) {
      await postsTestHelper.setLikeStatus(post.id, inputLike, {
        accessToken: accessToken1,
      });
    }

    for (const post of posts) {
      await postsTestHelper.setLikeStatus(post.id, inputDislike, {
        accessToken: accessToken2,
      });
    }

    for (const post of posts) {
      const postResponse = await postsTestHelper.getPost(post.id);
      expect(postResponse.body.extendedLikesInfo.likesCount).toBe(1);
      expect(postResponse.body.extendedLikesInfo.dislikesCount).toBe(1);

      const user1Response = await postsTestHelper.getPost(post.id, {
        accessToken: accessToken1,
      });
      expect(user1Response.body.extendedLikesInfo.myStatus).toBe(
        LikeStatus.Like,
      );

      const user2Response = await postsTestHelper.getPost(post.id, {
        accessToken: accessToken2,
      });
      expect(user2Response.body.extendedLikesInfo.myStatus).toBe(
        LikeStatus.Dislike,
      );
    }
  });

  it('should display only newest 3 likes and preserve order when user removes and re-adds like', async () => {
    const blog = await blogsTestHelper.createRandomBlog();
    const post = await postsTestHelper.createRandomPost(blog.id);

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
      await postsTestHelper.setLikeStatus(post.id, inputLike, {
        accessToken: token,
      });
    }

    let postResponse = await postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(5);
    expect(postResponse.body.extendedLikesInfo.newestLikes).toHaveLength(3);

    const newestLikesLogins =
      postResponse.body.extendedLikesInfo.newestLikes.map(
        (like: NewestLike) => like.login,
      );

    expect(newestLikesLogins[0]).toBe(userLogins[4]);
    expect(newestLikesLogins[1]).toBe(userLogins[3]);
    expect(newestLikesLogins[2]).toBe(userLogins[2]);

    expect(newestLikesLogins[3]).not.toBe(userLogins[1]);
    expect(newestLikesLogins[4]).not.toBe(userLogins[0]);

    await postsTestHelper.setLikeStatus(post.id, inputNone, {
      accessToken: accessTokens[0],
    });

    postResponse = await postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(4);

    await postsTestHelper.setLikeStatus(post.id, inputLike, {
      accessToken: accessTokens[0],
    });

    postResponse = await postsTestHelper.getPost(post.id);
    expect(postResponse.body.extendedLikesInfo.likesCount).toBe(5);

    expect(postResponse.body.extendedLikesInfo.newestLikes).toHaveLength(3);

    const updatedNewestLikesLogins =
      postResponse.body.extendedLikesInfo.newestLikes.map(
        (like: NewestLike) => like.login,
      );

    expect(updatedNewestLikesLogins).not.toEqual(
      expect.arrayContaining([accessTokens[0]]),
    );
  });
});
