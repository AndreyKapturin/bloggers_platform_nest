import { faker } from '@faker-js/faker';
import { HttpCreateBlogPostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpCreateBlogPost.dto';
import { HttpCreatePostDto } from '../../src/modules/bloggers-platform/posts/api/dto/HttpCreatePost.dto';
import { ViewPostDto } from '../../src/modules/bloggers-platform/posts/api/dto/ViewPost.dto';
import { LIKE_STATUSES_REG_EXP } from './reg-exp';
import { expectedNewestLike } from './SA_PostsTestHelper';

export const PostsDtoFabrics = {
  createBlogPostInputDto(): HttpCreateBlogPostDto {
    const title = faker.lorem.words({ min: 1, max: 2 });
    const shortDescription = faker.lorem.sentence({ min: 3, max: 10 });
    const content = faker.lorem.sentence({ min: 5, max: 45 });
    return {
      title,
      shortDescription,
      content,
    };
  },

  createInputDto(blogId: string): HttpCreatePostDto {
    return {
      ...this.createBlogPostInputDto(),
      blogId,
    };
  },

  createExpectedPost(overrdieFields: Partial<ViewPostDto> = {}) {
    const expectedPost: ViewPostDto = {
      id: expect.any(String),
      title: expect.any(String),
      shortDescription: expect.any(String),
      content: expect.any(String),
      blogName: expect.any(String),
      blogId: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: expect.any(Number),
        dislikesCount: expect.any(Number),
        myStatus: expect.stringMatching(LIKE_STATUSES_REG_EXP),
        newestLikes: expect.arrayOf(expectedNewestLike),
      },
      ...overrdieFields,
    };
    return expectedPost;
  },
};
