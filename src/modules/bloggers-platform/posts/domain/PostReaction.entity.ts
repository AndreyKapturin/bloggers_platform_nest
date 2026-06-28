// import { Column, CreateDateColumn, Entity, ForeignKey } from 'typeorm';
// import { LikeStatus } from '../../dto/HttpLikeStatus.dto';
// import { Post } from './Post.entity';

// @Entity('postReactions')
// export class PostReaction {
//   @Column({ nullable: false })
//   @ForeignKey(() => Post)
//   postId!: string;

//   @Column({ nullable: false })
//   userId!: string;

//   @Column({ enum: LikeStatus })
//   status!: LikeStatus;

//   @CreateDateColumn()
//   addedAt!: Date;
// }
