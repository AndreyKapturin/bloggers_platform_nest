import { Comment, TExtendedCommentModel } from '../domain/comment.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ViewCommentDto } from '../api/dto/ViewComment.dto';
import { CommentsQueryParamsDto } from '../api/dto/CommentsQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SortDirection } from '../../../../core/dto/BaseQueryParams.dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectRepository(Comment)
    private readonly commentEntityRepo: Repository<Comment>,
  ) {}

  async findById(
    id: string,
    userId: string | null,
  ): Promise<ViewCommentDto | null> {
    const comment = await this.commentEntityRepo
      .createQueryBuilder('c')
      .leftJoin('users', 'u', '"u"."id" = "c"."userId"')
      .leftJoin('commentReactions', 'cr', '"cr"."commentId" = "c"."id"')
      .leftJoin(
        'commentReactions',
        'ur',
        `"ur"."commentId" = "c"."id" AND "ur"."userId" = :userId`,
        { userId },
      )
      .select([
        '"c"."id"',
        '"c"."content"',
        '"c"."postId"',
        '"c"."createdAt"',
        '"c"."userId"',
        '"u"."login" AS "userLogin"',
      ])
      .addSelect(
        `COUNT(CASE WHEN "cr"."status" = 'Like' THEN 1 END)::integer AS "likesCount"`,
      )
      .addSelect(
        `COUNT(CASE WHEN "cr"."status" = 'Dislike' THEN 1 END)::integer AS "dislikesCount"`,
      )
      .addSelect(
        `CASE WHEN "ur"."status" IS NULL THEN 'None' ELSE "ur"."status" END AS "myStatus"`,
      )
      .where(`"c"."id" = :commentId`, { commentId: id })
      .groupBy(
        `"c"."id",
        "c"."content",
        "c"."postId",
        "c"."createdAt",
        "c"."userId",
        "u"."login",
        "ur"."status"`,
      )
      .getRawOne<TExtendedCommentModel>();

    return comment ? ViewCommentDto.toView(comment) : null;
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

    const queryBuilder = this.commentEntityRepo
      .createQueryBuilder('c')
      .leftJoin('users', 'u', '"u"."id" = "c"."userId"')
      .leftJoin('commentReactions', 'cr', '"cr"."commentId" = "c"."id"')
      .leftJoin(
        'commentReactions',
        'ur',
        `"ur"."commentId" = "c"."id" AND "ur"."userId" = :userId`,
        { userId },
      )
      .select([
        '"c"."id"',
        '"c"."content"',
        '"c"."postId"',
        '"c"."createdAt"',
        '"c"."userId"',
        '"u"."login" AS "userLogin"',
      ])
      .addSelect(
        `COUNT(CASE WHEN "cr"."status" = 'Like' THEN 1 END)::integer AS "likesCount"`,
      )
      .addSelect(
        `COUNT(CASE WHEN "cr"."status" = 'Dislike' THEN 1 END)::integer AS "dislikesCount"`,
      )
      .addSelect(
        `CASE WHEN "ur"."status" IS NULL THEN 'None' ELSE "ur"."status" END AS "myStatus"`,
      )
      .where(`"c"."postId" = :postId`, { postId })
      .groupBy(
        `"c"."id",
        "c"."content",
        "c"."postId",
        "c"."createdAt",
        "c"."userId",
        "u"."login",
        "ur"."status"`,
      )
      .limit(pageSize)
      .offset(skip)
      .orderBy(
        `"${sortBy}"`,
        sortDirection === SortDirection.Asc ? 'ASC' : 'DESC',
      );

    const extendedComments =
      await queryBuilder.getRawMany<TExtendedCommentModel>();
    const totalCount = await queryBuilder.getCount();

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
