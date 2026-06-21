import { ViewCommentDto } from '../../api/dto/ViewComment.dto';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/Comments.query-repository';

export class GetCommentQuery extends Query<ViewCommentDto> {
  constructor(
    public commentId: string,
    public userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetCommentQuery)
export class GetCommentQueryHandler implements IQueryHandler<
  GetCommentQuery,
  ViewCommentDto
> {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  async execute(query: GetCommentQuery) {
    const viewComment = await this.commentsQueryRepository.findByIdOrThrow(
      query.commentId,
      query.userId,
    );
    return viewComment;
  }
}
