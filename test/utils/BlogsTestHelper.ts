import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { faker } from '@faker-js/faker';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { HttpCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpCreateBlog.dto';
import { DB_BLOG_CONSTRAINTS } from '../../src/modules/bloggers-platform/blogs/domain/blog.entity';

export class BlogsTestHelper {
  constructor(private app: INestApplication) {}

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
  }

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
  }

  async createBlog(
    dto: HttpCreateBlogDto,
    options?: { status: HttpStatus },
  ): Promise<Response> {
    return request(this.app.getHttpServer())
      .post('/blogs')
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(dto)
      .expect(options?.status ?? HttpStatus.CREATED);
  }

  async createRandomBlog(): Promise<ViewBlogDto> {
    const dto = this.createInputDto();
    const createBlogResponse = await this.createBlog(dto);
    return createBlogResponse.body;
  }

  async createRandomBlogs(count: number): Promise<ViewBlogDto[]> {
    const responses = new Array(count);

    for (let i = 0; i < count; i++) {
      responses[i] = await this.createRandomBlog();
    }

    return responses;
  }
}
