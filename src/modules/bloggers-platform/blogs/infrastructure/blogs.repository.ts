import { Injectable } from '@nestjs/common';
import { TBlogModel } from '../domain/blog.entity';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DomainCreateBlogDto } from '../domain/dto/DomainCreateBlog.dto';
import { DomainUpdateBlogDto } from '../domain/dto/DomainUpdateBlog.dto';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: string): Promise<TBlogModel | null> {
    const rows = await this.dataSource.query<TBlogModel[]>(
      `SELECT
        "id",
        "name",
        "description",
        "websiteUrl",
        "createdAt"
      FROM "blogs"
      WHERE "id" = $1
      LIMIT 1;`,
      [id],
    );
    return rows[0] ?? null;
  }

  async findByIdOrThrow(id: string): Promise<TBlogModel> {
    const foundBlog = await this.findById(id);

    if (!foundBlog) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `Blog with id ${id} not found`,
        [
          {
            field: 'blogId',
            message: `Blog with id ${id} not found`,
          },
        ],
      );
    }

    return foundBlog;
  }

  async create(dto: DomainCreateBlogDto): Promise<string> {
    const rows = await this.dataSource.query<{ id: string }>(
      `INSERT INTO "blogs"
        ("name", "description", "websiteUrl")
      VALUES ($1, $2, $3)
      RETURNING "id";`,
      [dto.name, dto.description, dto.websiteUrl],
    );
    return rows[0].id;
  }
  
  async update(dto: DomainUpdateBlogDto): Promise<void> {
    await this.dataSource.query(
      `UPDATE "blogs"
      SET
	      "name" = $1,
	      "description" = $2,
	      "websiteUrl" = $3
      WHERE
	    "id" = $4;`,
      [dto.name, dto.description, dto.websiteUrl, dto.blogId],
    );
  }

  async delete(id: string): Promise<void> {
    await this.dataSource.query(`DELETE FROM "blogs" WHERE "id" = $1;`, [id]);
  }
}
