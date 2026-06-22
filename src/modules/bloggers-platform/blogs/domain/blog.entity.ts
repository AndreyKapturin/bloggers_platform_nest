import { Column, Entity } from 'typeorm';
import { BaseDbEntity } from '../../../../core/BaseDbEntity';
import { DomainCreateBlogDto } from './dto/DomainCreateBlog.dto';
import { DomainUpdateBlogDto } from './dto/DomainUpdateBlog.dto';

export const DB_BLOG_CONSTRAINTS = {
  NAME_MAX_LENGTH: 15,
  DESCRIPTION_MAX_LENGTH: 500,
  WEBSITE_URL_MAX_LENGTH: 100,
};

@Entity('blogs')
export class Blog extends BaseDbEntity {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  name!: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  description!: string;
  @Column({
    type: 'varchar',
    nullable: false,
  })
  websiteUrl!: string;

  update(dto: DomainUpdateBlogDto): void {
    this.name = dto.name;
    this.description = dto.description;
    this.websiteUrl = dto.websiteUrl;
  }

  static create(dto: DomainCreateBlogDto) {
    const blog = new this();
    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;
    return blog;
  }
}
