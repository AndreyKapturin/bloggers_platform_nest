import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { DomainCreateBlogDto } from './dto/DomainCreateBlog.dto';
import { InputUpdateBlogDto } from '../dto/Blog.input-update-dto';

export const DB_BLOG_CONSTRAINTS = {
  NAME_MAX_LENGTH: 15,
  DESCRIPTION_MAX_LENGTH: 500,
  WEBSITE_URL_MAX_LENGTH: 100,
};

@Schema({ timestamps: true })
export class Blog {
  @Prop({
    type: String,
    required: true,
    maxLength: DB_BLOG_CONSTRAINTS.NAME_MAX_LENGTH,
  })
  name!: string;

  @Prop({
    type: String,
    required: true,
    maxLength: DB_BLOG_CONSTRAINTS.DESCRIPTION_MAX_LENGTH,
  })
  description!: string;

  @Prop({
    type: String,
    required: true,
    maxLength: DB_BLOG_CONSTRAINTS.WEBSITE_URL_MAX_LENGTH,
  })
  websiteUrl!: string;

  @Prop({ type: Boolean, required: true, default: false })
  isMembership!: boolean;

  createdAt!: Date;
  updatedAt!: Date;

  static makeInstanse(createBlogDto: DomainCreateBlogDto): TBlogDocument {
    const blog = new this();
    blog.name = createBlogDto.name;
    blog.description = createBlogDto.description;
    blog.websiteUrl = createBlogDto.websiteUrl;
    return blog as TBlogDocument;
  }

  update(inputUpdateBlogDto: InputUpdateBlogDto): void {
    this.name = inputUpdateBlogDto.name;
    this.description = inputUpdateBlogDto.description;
    this.websiteUrl = inputUpdateBlogDto.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
export type TBlogDocument = HydratedDocument<Blog>;
export type TBlogModel = Model<Blog> & typeof Blog;
