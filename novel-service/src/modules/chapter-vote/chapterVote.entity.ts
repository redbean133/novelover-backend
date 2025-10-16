import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
} from 'typeorm';
import { Chapter } from '../chapter/chapter.entity';

@Entity()
@Unique(['userId', 'chapterId'])
export class ChapterVote {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string;

  @Column()
  chapterId: number;

  @ManyToOne(() => Chapter, (chapter) => chapter.votes, { onDelete: 'CASCADE' })
  chapter: Chapter;
}
