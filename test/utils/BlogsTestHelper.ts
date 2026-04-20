import { INestApplication, HttpStatus } from '@nestjs/common';
import request, { Response } from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { faker } from '@faker-js/faker';
import { InputCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.input-create-dto';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/dto/Blog.view-dto';

const BLOG_CONSTRAINTS = {
  NAME_MAX_LENGTH: 15,
  DESCRIPTION_MAX_LENGTH: 500,
  WEBSITE_MAX_LENGTH: 100,
};

export class BlogsTestHelper {
  constructor(private app: INestApplication) {}

  createInputDto() {
    const name = faker.string.alphanumeric({
      length: {
        min: 1,
        max: BLOG_CONSTRAINTS.NAME_MAX_LENGTH,
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

  async createBlog(
    dto: InputCreateBlogDto,
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
