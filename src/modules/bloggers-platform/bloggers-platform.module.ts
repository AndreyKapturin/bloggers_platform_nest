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

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
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
  ],
})
export class BloggersPlatformModule {}
