import type { TBlogModel } from '../domain/blog.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { ViewBlogDto } from '../api/dto/Blog.view-dto';
import { BlogsQueryParamsDto } from '../api/dto/BlogQueryParams.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async find(query: BlogsQueryParamsDto): Promise<PaginatedView<ViewBlogDto>> {
    const {
      pageNumber,
      pageSize,
      searchNameTerm,
      skip,
      sortBy,
      sortDirection,
    } = query;

    const whereParams: (string | number)[] = [];
    const conditions: string[] = [];

    const fromPart = `FROM "blogs"`;
    let wherePart = '';

    if (searchNameTerm) {
      whereParams.push(`%${searchNameTerm}%`);
      conditions.push(`"name" ILIKE $${whereParams.length}`);
    }

    if (conditions.length > 0) {
      wherePart += 'WHERE ' + conditions.join(' OR ');
    }

    const params = [...whereParams];

    const orderPath = `ORDER BY "${sortBy}" ${sortDirection}`;

    params.push(pageSize);
    const limitPart = `LIMIT $${params.length}`;

    params.push(skip);
    const offsetPart = `OFFSET $${params.length}`;

    const getBlogsSql = `
      SELECT
        "id",
        "name",
        "description",
        "websiteUrl",
        "createdAt"
      ${fromPart}
      ${wherePart}
      ${orderPath}
      ${limitPart}
      ${offsetPart}`;

    const blogs = await this.dataSource.query<TBlogModel[]>(
      getBlogsSql,
      params,
    );

    const getTotalCountSql = `
      SELECT
        COUNT(*)::integer as "totalCount"
      ${fromPart}
      ${wherePart};`;

    const [{ totalCount }] = await this.dataSource.query<
      { totalCount: number }[]
    >(getTotalCountSql, whereParams);

    const viewBlogs = blogs.map((blog) => ViewBlogDto.toView(blog));
    const paginatedBlogs = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewBlogs,
    );
    return paginatedBlogs;
  }

  async findById(id: string): Promise<ViewBlogDto> {
    const rows = await this.dataSource.query<TBlogModel[]>(
      `SELECT
        "id",
        "name",
        "description",
        "websiteUrl",
        "createdAt"
      FROM "blogs"
      WHERE "id" = $1
      LIMIT 1;`,
      [id],
    );
    if (!rows[0]) {
      throw new NotFoundException(`Blog with id ${id} not found`);
    }

    return ViewBlogDto.toView(rows[0]);
  }
}
