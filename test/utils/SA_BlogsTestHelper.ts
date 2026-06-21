import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { HttpCreateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpCreateBlog.dto';
import { ResponseWithBody } from './generics';
import { HttpUpdateBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/HttpUpdateBlog.dto';
import { PaginatedView } from '../../src/core/dto/PaginatedView.dto';
import { BlogsQueryParamsDto } from '../../src/modules/bloggers-platform/blogs/api/dto/BlogQueryParams.dto';
import { BlogsDtoFabrics } from './BlogDtoFabrics';

export class SA_BlogsTestHelper {
  private BASE_URL = '/sa/blogs';

  constructor(private app: INestApplication) {}

  createInputDto(): HttpCreateBlogDto {
    return BlogsDtoFabrics.createInputDto();
  }

  createExpectedBlog(overrideFields: Partial<ViewBlogDto> = {}): ViewBlogDto {
    return BlogsDtoFabrics.createExpectedBlog(overrideFields);
  }

  async getBlogsWithQuery(options?: {
    status?: HttpStatus;
    auth?: boolean;
    filter?: Partial<BlogsQueryParamsDto>;
  }): Promise<ResponseWithBody<PaginatedView<ViewBlogDto>>> {
    const innerOptions = {
      status: HttpStatus.OK,
      auth: true,
      ...options,
    };

    const getBlogsRequest = request(this.app.getHttpServer()).get(
      this.BASE_URL,
    );

    if (innerOptions.filter) {
      getBlogsRequest.query(innerOptions.filter);
    }

    if (innerOptions.auth) {
      getBlogsRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return getBlogsRequest.expect(innerOptions.status);
  }

  async createBlog(
    dto: HttpCreateBlogDto,
    options?: { status?: HttpStatus; auth?: boolean },
  ): Promise<ResponseWithBody<ViewBlogDto>> {
    const innerOptions = {
      status: HttpStatus.CREATED,
      auth: true,
      ...options,
    };

    const createBlogRequest = request(this.app.getHttpServer())
      .post(this.BASE_URL)
      .send(dto)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      createBlogRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return createBlogRequest;
  }

  async updateBlog(
    id: string,
    dto: HttpUpdateBlogDto,
    options?: { status?: HttpStatus; auth?: boolean },
  ) {
    const innerOptions = {
      status: HttpStatus.NO_CONTENT,
      auth: true,
      ...options,
    };

    const updateBlogRequest = request(this.app.getHttpServer())
      .put(`${this.BASE_URL}/${id}`)
      .send(dto)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      updateBlogRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return updateBlogRequest;
  }

  async deleteBlog(
    id: string,
    options?: { status?: HttpStatus; auth?: boolean },
  ) {
    const innerOptions = {
      status: HttpStatus.NO_CONTENT,
      auth: true,
      ...options,
    };

    const deleteBlogRequest = request(this.app.getHttpServer())
      .delete(`${this.BASE_URL}/${id}`)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      deleteBlogRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return deleteBlogRequest;
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
