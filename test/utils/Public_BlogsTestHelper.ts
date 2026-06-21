import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ViewBlogDto } from '../../src/modules/bloggers-platform/blogs/api/dto/Blog.view-dto';
import { ResponseWithBody } from './generics';
import { PaginatedView } from '../../src/core/dto/PaginatedView.dto';
import { BlogsQueryParamsDto } from '../../src/modules/bloggers-platform/blogs/api/dto/BlogQueryParams.dto';
import { BlogsDtoFabrics } from './BlogDtoFabrics';

export class Public_BlogsTestHelper {
  private BASE_URL = '/blogs';

  constructor(private app: INestApplication) {}

  createExpectedBlog(overrideFields: Partial<ViewBlogDto> = {}): ViewBlogDto {
    return BlogsDtoFabrics.createExpectedBlog(overrideFields);
  }

  async getBlogById(
    id: string,
    options?: { status: HttpStatus },
  ): Promise<ResponseWithBody<ViewBlogDto>> {
    return request(this.app.getHttpServer())
      .get(`${this.BASE_URL}/${id}`)
      .expect(options?.status ?? HttpStatus.OK);
  }

  async getBlogsWithQuery(
    filter?: Partial<BlogsQueryParamsDto>,
  ): Promise<ResponseWithBody<PaginatedView<ViewBlogDto>>> {
    const query = request(this.app.getHttpServer()).get(this.BASE_URL);

    if (filter) {
      query.query(filter);
    }

    return query.expect(HttpStatus.OK);
  }
}
