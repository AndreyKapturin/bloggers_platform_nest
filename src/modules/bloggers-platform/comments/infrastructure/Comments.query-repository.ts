import { TExtendedCommentModel } from '../domain/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ViewCommentDto } from '../api/dto/ViewComment.dto';
import { CommentsQueryParamsDto } from '../api/dto/CommentsQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: string): Promise<ViewCommentDto | null> {
    const rows = await this.dataSource.query<TExtendedCommentModel>(
      `SELECT
        "c"."id",
        "c"."content",
        "c"."postId",
        "c"."createdAt",
        "c"."userId",
        "u"."login" AS "userLogin",
        COUNT(CASE WHEN "cr"."status" = 'Like' THEN 1 END)::integer AS "likesCount",
        COUNT(CASE WHEN "cr"."status" = 'Dislike' THEN 1 END)::integer AS "dislikesCount"
      FROM "comments" "c"
      LEFT JOIN "users" "u" ON "u"."id" = "c"."userId"
      LEFT JOIN "commentReactions" "cr" ON "cr"."commentId" = "c"."id"
      WHERE "c"."id" = $1
      GROUP BY "c"."id", "c"."content", "c"."postId", "c"."createdAt", "c"."userId", "u"."login"
      LIMIT 1;`,
      [id],
    );

    return rows[0] ? ViewCommentDto.toView(rows[0]) : null;
  }

  async findByIdOrThrow(id: string): Promise<ViewCommentDto> {
    const viewComment = await this.findById(id);
    if (!viewComment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return viewComment;
  }

  async findForPost(
    postId: string,
    query: CommentsQueryParamsDto,
  ): Promise<PaginatedView<ViewCommentDto>> {
    const { pageNumber, pageSize, skip, sortBy, sortDirection } = query;

    const getPostCommentsSql = `
      SELECT
        "c"."id",
        "c"."content",
        "c"."postId",
        "c"."createdAt",
        "c"."userId",
        "u"."login" AS "userLogin",
        COUNT(CASE WHEN "cr"."status" = 'Like' THEN 1 END)::integer AS "likesCount",
        COUNT(CASE WHEN "cr"."status" = 'Dislike' THEN 1 END)::integer AS "dislikesCount"
      FROM "comments" "c"
      LEFT JOIN "users" "u" ON "u"."id" = "c"."userId"
      LEFT JOIN "commentReactions" "cr" ON "cr"."commentId" = "c"."id"
      WHERE "c"."postId" = $1
      GROUP BY "c"."id", "c"."content", "c"."postId", "c"."createdAt", "c"."userId", "u"."login"
      ORDER BY "${sortBy}" ${sortDirection}
      OFFSET $2 LIMIT $3`;

    const extendedComments = await this.dataSource.query<
      TExtendedCommentModel[]
    >(getPostCommentsSql, [postId, skip, pageSize]);

    const getTotalCountSql = `
      SELECT
        COUNT(*)::integer as "totalCount"
      FROM "comments"
      WHERE "postId" = $1;`;

    const [{ totalCount }] = await this.dataSource.query<
      { totalCount: number }[]
    >(getTotalCountSql, [postId]);

    const viewComments = extendedComments.map((extendedComment) =>
      ViewCommentDto.toView(extendedComment),
    );
    const paginatedViewComments = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewComments,
    );
    return paginatedViewComments;
  }
}
