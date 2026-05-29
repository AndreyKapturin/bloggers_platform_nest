import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { TPostModel } from '../domain/Post.entity';
import { DomainCreatePostDto } from '../domain/dto/DomainCreatePost.dto';
import { DomainUpdatePostDto } from '../domain/dto/DomainUpdatePost.dto';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: string): Promise<TPostModel | null> {
    const rows = await this.dataSource.query<TPostModel>(
      `SELECT 
	      "id",
	      "title",
	      "shortDescription",
	      "content",
	      "blogId",
	      "createdAt"
      FROM "posts"
      WHERE "id" = $1
      LIMIT 1;`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByIdOrThrow(id: string): Promise<TPostModel> {
    const postDocument = await this.findById(id);

    if (!postDocument) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Post with id ${id} not found`,
        [{ field: 'postId', message: `Post with id ${id} not found` }],
      );
    }

    return postDocument;
  }

  async create(dto: DomainCreatePostDto): Promise<string> {
    const rows = await this.dataSource.query<{ id: string }>(
      `INSERT INTO "posts"
	      ("title", "shortDescription", "content", "blogId")
      VALUES ($1, $2, $3, $4)
      RETURNING "id";`,
      [dto.title, dto.shortDescription, dto.content, dto.blogId],
    );
    return rows[0].id;
  }

  async update(postId: string, dto: DomainUpdatePostDto): Promise<void> {
    await this.dataSource.query(
      `UPDATE "posts"
      SET
        "title" = $1,
        "shortDescription" = $2,
        "content" = $3,
        "blogId" = $4
      WHERE "id" = $5;`,
      [dto.title, dto.shortDescription, dto.content, dto.blogId, postId],
    );
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM "posts" WHERE "id" = $1;`, [id]);
  }
}
