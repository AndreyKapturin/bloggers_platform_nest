import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreateBlogDto } from '../dto/Blog.create-dto';
import { InputUpdateBlogDto } from '../dto/Blog.input-update-dto';

@Schema({ timestamps: true })
export class Blog {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: String, required: true })
  websiteUrl: string;

  @Prop({ type: String, required: true, default: false })
  isMembership: boolean;

  createdAt: Date;
  updatedAt: Date;

  static makeInstanse(createBlogDto: CreateBlogDto): TBlogDocument {
    const blog = new this();
    blog.name = createBlogDto.name;
    blog.description = createBlogDto.description;
    blog.websiteUrl = createBlogDto.websiteUrl;
    blog.isMembership = false;
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

