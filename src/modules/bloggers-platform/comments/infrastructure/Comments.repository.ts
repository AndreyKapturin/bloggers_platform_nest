import { TCommentModel } from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DomainCreateCommentDto } from '../domain/dto/DomainCreateComment.dto';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: string): Promise<TCommentModel | null> {
    const rows = await this.dataSource.query<TCommentModel>(
      `SELECT
        "id",
        "content",
        "postId",
        "createdAt",
        "userId"
      FROM "comments"
      WHERE "id" = $1
      LIMIT 1;`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByIdOrThrow(id: string): Promise<TCommentModel> {
    const commentDocument = await this.findById(id);

    if (!commentDocument) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Comment with id ${id} not found`,
        [{ field: 'commentId', message: `Comment with id ${id} not found` }],
      );
    }

    return commentDocument;
  }

  async create(dto: DomainCreateCommentDto): Promise<string> {
    const rows = await this.dataSource.query<{ id: string }[]>(
      `INSERT INTO "comments"
	      ("content", "postId", "userId")
      VALUES ($1, $2, $3)
      RETURNING "id";`,
      [dto.content, dto.postId, dto.userId],
    );

    return rows[0].id;
  }

  async update(commentId: string, newContent: string): Promise<void> {
    await this.dataSource.query(
      `UPDATE "comments" SET "content" = $1 WHERE "id" = $2;`,
      [newContent, commentId],
    );
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM "comments" WHERE "id" = $1;`, [
      id,
    ]);
  }
}
