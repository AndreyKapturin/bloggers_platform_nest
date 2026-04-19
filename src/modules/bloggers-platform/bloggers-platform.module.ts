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

const useCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  LikeCommentUseCase,
];

const queries = [
  GetCommentQueryHandler,
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentReaction.name, schema: CommentReactionSchema },
    ]),
    UserAccountsModule,
  ],
  controllers: [BlogsController, PostsController, CommentsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    PostsService,
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
