import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { HttpCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpCreateBlog.dto';
import { faker } from '@faker-js/faker';
import { DB_BLOG_CONSTRAINTS } from '../../src/modules/bloggers-platform/blogs/domain/blog.entity';

export const BlogsDtoFabrics = {
  createInputDto(): HttpCreateBlogDto {
    const name = faker.string.alphanumeric({
      length: {
        min: 1,
        max: DB_BLOG_CONSTRAINTS.NAME_MAX_LENGTH,
      },
      casing: 'mixed',
    });
    const description = faker.lorem.sentence({ min: 5, max: 20 });
    const websiteUrl = faker.internet.url({ protocol: 'https' });

    return {
      name,
      description,
      websiteUrl,
    };
  },

  createExpectedBlog(overrideFields: Partial<ViewBlogDto> = {}): ViewBlogDto {
    return {
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      websiteUrl: expect.any(String),
      isMembership: false, // by default
      createdAt: expect.any(String),
      ...overrideFields,
    };
  },
};
