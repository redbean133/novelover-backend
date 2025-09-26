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

  @Column({ type: 'bigint', nullable: false })
  orderIndex: number;

  @Column({ type: 'int', nullable: true })
  prevChapterId: number | null;

  @Column({ type: 'int', nullable: true })
  nextChapterId: number | null;

  @Column({ nullable: true })
  audioUrl?: string;

  @Column({ nullable: true })
  audioVersion?: number;

  @Column({ default: 1 })
  contentVersion: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
