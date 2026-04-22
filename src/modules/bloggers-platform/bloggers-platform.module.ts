import { Module } from '@nestjs/common';
import { BlogsController } from './blogs/api/blogs.controller';
import { BlogsService } from './blogs/application/blogs.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './blogs/domain/blog.entity';
import { BlogsRepository } from './blogs/infrastructure/blogs.repository';
import { BlogsQueryRepository } from './blogs/infrastructure/blogs.query-repository';
import { PostsController } from './posts/api/posts.controller';
import { PostsService } from './posts/application/posts.service';
import { Post, PostSchema } from './posts/domain/Post.entity';
import { PostsQueryRepository } from './posts/infrastructure/Post.query-repository';
import { PostsRepository } from './posts/infrastructure/Post.repository';
import { CommentsService } from './comments/application/comments.service';
import { CommentsController } from './comments/api/comments.controller';
import { Comment, CommentSchema } from './comments/domain/comment.entity';
import { CommentsRepository } from './comments/infrastructure/Comments.repository';
import { CommentsQueryRepository } from './comments/infrastructure/Comments.query-repository';
import { UserAccountsModule } from '../user-accounts/user-accounts.module';
import { CreateCommentUseCase } from './comments/application/useCases/create-comment.use-case';
import { UpdateCommentUseCase } from './comments/application/useCases/update-comment.use-case';
import { DeleteCommentUseCase } from './comments/application/useCases/delete-comment.use-case';
import { LikeCommentUseCase } from './comments/application/useCases/like-comment.use-case';
import {
  CommentReaction,
  CommentReactionSchema,
} from './comments/domain/comment-reaction.entity';
import { CommentReactionRepository } from './comments/infrastructure/CommentReaction.repository';
import { GetCommentQueryHandler } from './comments/application/queries/get-comment-by-id.query';
import { GetPostCommentsQueryHandler } from './comments/application/queries/get-comments-for-post.query';
import { LikePostUseCase } from './posts/application/useCases/like-post.use-case';
import { PostReactionsRepository } from './posts/infrastructure/PostReactions.repository';
import {
  PostReaction,
  PostReactionSchema,
} from './posts/domain/post-reaction.entity';
import { GetPostQueryHandler } from './posts/application/queries/get-post.query';
import { GetPostsQueryHandler } from './posts/application/queries/get-posts.query';
import { CreateBlogUseCase } from './blogs/application/useCases/create-blog.use-case';

const useCases = [
  CreateBlogUseCase,
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  LikeCommentUseCase,
  LikePostUseCase,
];

const queries = [
  GetCommentQueryHandler,
  GetPostCommentsQueryHandler,
  GetPostQueryHandler,
  GetPostsQueryHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentReaction.name, schema: CommentReactionSchema },
      { name: PostReaction.name, schema: PostReactionSchema },
    ]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
    PostReactionsRepository,
    PostsRepository,
    PostsQueryRepository,
    CommentsService,
    CommentsRepository,
    CommentsQueryRepository,
    CommentReactionRepository,
    ...useCases,
    ...queries,
  ],
})
export class BloggersPlatformModule {}
