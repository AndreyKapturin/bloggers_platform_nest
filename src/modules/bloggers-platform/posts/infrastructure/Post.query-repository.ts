import { Injectable, NotFoundException } from '@nestjs/common';
import { TPostWithBlogName, type TPostModel } from '../domain/Post.entity';
import { ViewPostDto } from '../api/dto/VIewPost.dto';
import { PostsQueryParamsDto } from '../api/dto/PostQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: string): Promise<ViewPostDto> {
    const rows = await this.dataSource.query<TPostWithBlogName>(
      `SELECT 
        "p"."id",
        "p"."title",
        "p"."shortDescription",
        "p"."content",
        "p"."blogId",
        "b"."name" AS "blogName",
        "p"."createdAt"
      FROM "posts" "p"
      LEFT JOIN "blogs" "b" ON "b"."id" = "p"."blogId"
      WHERE "p"."id" = $1
      LIMIT 1;`,
      [id],
    );
    if (!rows[0]) throw new NotFoundException(`Post with id ${id} not found`);
    return ViewPostDto.toView(rows[0]);
  }

  async find(query: PostsQueryParamsDto): Promise<PaginatedView<ViewPostDto>> {
    return this._find({}, query);
  }

  async findForBlog(
    blogId: string,
    query: PostsQueryParamsDto,
  ): Promise<PaginatedView<ViewPostDto>> {
    return this._find({ blogId }, query);
  }

  private async _find(
    filter: Partial<TPostModel>,
    query: PostsQueryParamsDto,
  ): Promise<PaginatedView<ViewPostDto>> {
    const { pageNumber, pageSize, skip, sortBy, sortDirection } = query;

    const whereParams: (string | number)[] = [];
    const conditions: string[] = [];

    const fromPart = `
    FROM "posts" "p"
    LEFT JOIN "blogs" "b" ON "b"."id" = "p"."blogId"`;

    let wherePart = '';

    if (filter.blogId) {
      whereParams.push(filter.blogId);
      conditions.push(`"blogId" = $${whereParams.length}`);
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

    const getPostsSql = `
      SELECT 
        "p"."id",
        "p"."title",
        "p"."shortDescription",
        "p"."content",
        "p"."blogId",
        "b"."name" AS "blogName",
        "p"."createdAt"
      ${fromPart}
      ${wherePart}
      ${orderPath}
      ${limitPart}
      ${offsetPart}`;

    const posts = await this.dataSource.query<TPostWithBlogName[]>(
      getPostsSql,
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

    const viewPosts = posts.map((post) => ViewPostDto.toView(post));
    const paginatedPosts = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewPosts,
    );
    return paginatedPosts;
  }
}
