import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Novel } from '../novel/novel.entity';

@Entity()
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  novelId: number;

  @ManyToOne(() => Novel, (novel) => novel.chapters, { onDelete: 'CASCADE' })
  novel: Novel;

  @Column({ default: '' })
  title: string;

  @Column({ type: 'text', default: '' })
  content: string;

  @Column({ default: 0 })
  numberOfViews: number;

  @Column({ default: 0 })
  numberOfWords: number;

  @Column({ default: 0 })
  numberOfVotes: number;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
