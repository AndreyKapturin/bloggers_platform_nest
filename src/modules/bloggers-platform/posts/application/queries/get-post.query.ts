import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { ViewPostDto } from '../../api/dto/VIewPost.dto';
import { PostsQueryRepository } from '../../infrastructure/Post.query-repository';

export class GetPostQuery extends Query<ViewPostDto> {
  constructor(
    public postId: string,
    public userId: string | null,
  ) {
    super();
  }
}

@QueryHandler(GetPostQuery)
export class GetPostQueryHandler implements IQueryHandler<
  GetPostQuery,
  ViewPostDto
> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute(query: GetPostQuery) {
    const { postId, userId } = query;
    const viewPost = await this.postsQueryRepository.findById(postId, userId);
    return viewPost;
  }
}
