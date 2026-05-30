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

  async findById(
    id: string,
    userId: string | null,
  ): Promise<ViewCommentDto | null> {
    const rows = await this.dataSource.query<TExtendedCommentModel>(
      `SELECT
        "c"."id",
        "c"."content",
        "c"."postId",
        "c"."createdAt",
        "c"."userId",
        "u"."login" AS "userLogin",
        COUNT(CASE WHEN "cr"."status" = 'Like' THEN 1 END)::integer AS "likesCount",
        COUNT(CASE WHEN "cr"."status" = 'Dislike' THEN 1 END)::integer AS "dislikesCount",
        CASE WHEN "ur"."status" IS NULL THEN 'None' ELSE "ur"."status" END AS "myStatus"
      FROM "comments" "c"
      LEFT JOIN "users" "u" ON "u"."id" = "c"."userId"
      LEFT JOIN "commentReactions" "cr" ON "cr"."commentId" = "c"."id"
      LEFT JOIN "commentReactions" "ur" ON
        "ur"."userId" = $2 AND
        "ur"."commentId" = "c"."id"
      WHERE "c"."id" = $1
      GROUP BY "c"."id", "c"."content", "c"."postId", "c"."createdAt", "c"."userId", "u"."login", "ur"."status"
      LIMIT 1;`,
      [id, userId],
    );

    return rows[0] ? ViewCommentDto.toView(rows[0]) : null;
  }

  async findByIdOrThrow(
    id: string,
    userId: string | null,
  ): Promise<ViewCommentDto> {
    const viewComment = await this.findById(id, userId);
    if (!viewComment) {
      throw new NotFoundException(`Comment with id ${id} not found`);
    }
    return viewComment;
  }

  async findForPost(
    postId: string,
    query: CommentsQueryParamsDto,
    userId: string | null,
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
        COUNT(CASE WHEN "cr"."status" = 'Dislike' THEN 1 END)::integer AS "dislikesCount",
        CASE WHEN "ur"."status" IS NULL THEN 'None' ELSE "ur"."status" END AS "myStatus"
      FROM "comments" "c"
      LEFT JOIN "users" "u" ON "u"."id" = "c"."userId"
      LEFT JOIN "commentReactions" "cr" ON "cr"."commentId" = "c"."id"
      LEFT JOIN "commentReactions" "ur" ON
        "ur"."userId" = $4 AND
        "ur"."commentId" = "c"."id"
      WHERE "c"."postId" = $1
      GROUP BY "c"."id", "c"."content", "c"."postId", "c"."createdAt", "c"."userId", "u"."login", "ur"."status"
      ORDER BY "c"."${sortBy}" ${sortDirection}
      LIMIT $2 OFFSET $3;`;

    const extendedComments = await this.dataSource.query<
      TExtendedCommentModel[]
    >(getPostCommentsSql, [postId, pageSize, skip, userId]);

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
