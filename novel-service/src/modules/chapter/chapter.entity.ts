import { Novel } from 'src/modules/novel/novel.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
@Unique(['novel', 'number'])
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @ManyToOne(() => Novel, (novel) => novel.chapters, { onDelete: 'CASCADE' })
  novel: Novel;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: 0 })
  numberOfViews: number;

  @Column({ default: 0 })
  numberOfWords: number;

  @Column({ default: 0 })
  numberOfVotes: number;

  @CreateDateColumn()
  publishedAt: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;
}
