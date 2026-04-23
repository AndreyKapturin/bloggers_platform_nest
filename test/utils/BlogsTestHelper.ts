import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { faker } from '@faker-js/faker';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { HttpCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpCreateBlog.dto';
import { DB_BLOG_CONSTRAINTS } from '../../src/modules/bloggers-platform/blogs/domain/blog.entity';
import { ResponseWithBody } from './generics';
import { HttpUpdateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpUpdateBlog.dto';

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

  async getBlogById(
    id: string,
    options?: { status: HttpStatus },
  ): Promise<ResponseWithBody<ViewBlogDto>> {
    return request(this.app.getHttpServer())
      .get(`/blogs/${id}`)
      .expect(options?.status ?? HttpStatus.OK);
  }

  async createBlog(
    dto: HttpCreateBlogDto,
    options?: { status: HttpStatus },
  ): Promise<ResponseWithBody<ViewBlogDto>> {
    return request(this.app.getHttpServer())
      .post('/blogs')
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(dto)
      .expect(options?.status ?? HttpStatus.CREATED);
  }

  async updateBlog(
    id: string,
    dto: HttpUpdateBlogDto,
    options?: { status: HttpStatus },
  ) {
    await request(this.app.getHttpServer())
      .put(`/blogs/${id}`)
      .auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' })
      .send(dto)
      .expect(options?.status ?? HttpStatus.NO_CONTENT);
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
