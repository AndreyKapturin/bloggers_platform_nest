import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  Post,
  TPostModel,
  TPostUserReactionModel,
} from '../domain/Post.entity';
import { DomainUpdatePostDto } from '../domain/dto/DomainUpdatePost.dto';
import { LikeStatus } from '../../dto/HttpLikeStatus.dto';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Post)
    private readonly postsEntityRepository: Repository<Post>,
  ) {}

  async findUserReaction(
    postId: string,
    userId: string,
  ): Promise<TPostUserReactionModel | null> {
    const rows = await this.dataSource.query<TPostUserReactionModel>(
      `SELECT
        "postId",
        "userId",
        "status",
        "addedAt"
      FROM "postReactions"
      WHERE "postId" = $1 AND "userId" = $2
      LIMIT 1;`,
      [postId, userId],
    );
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<TPostModel | null> {
    return this.postsEntityRepository.findOneBy({ id });
  }

  async findByIdOrThrow(id: string): Promise<TPostModel> {
    const post = await this.findById(id);

    if (!post) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Post with id ${id} not found`,
        [{ field: 'postId', message: `Post with id ${id} not found` }],
      );
    }

    return post;
  }

  async save(post: Post): Promise<void> {
    await this.postsEntityRepository.save(post);
  }

  async createReaction(
    postId: string,
    userId: string,
    newLikeStatus: LikeStatus,
  ): Promise<void> {
    await this.dataSource.query(
      `INSERT INTO 
          "postReactions" ("postId", "userId", "status")
        VALUES ($1, $2, $3);`,
      [postId, userId, newLikeStatus],
    );
  }

  async update(postId: string, dto: DomainUpdatePostDto): Promise<void> {
    await this.dataSource.query(
      `UPDATE "posts"
      SET
        "title" = $1,
        "shortDescription" = $2,
        "content" = $3
      WHERE "id" = $4;`,
      [dto.title, dto.shortDescription, dto.content, postId],
    );
  }

  async changeReactionStatus(
    postId: string,
    userId: string,
    newLikeStatus: LikeStatus,
  ): Promise<void> {
    await this.dataSource.query(
      `UPDATE "postReactions"
      SET "status" = $3
      WHERE "postId" = $1 AND "userId" = $2;`,
      [postId, userId, newLikeStatus],
    );
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM "posts" WHERE "id" = $1;`, [id]);
  }
}
