import { CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

export class BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @CreateDateColumn()
  createdAt!: Date;
}
