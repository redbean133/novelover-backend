import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable,
  DeleteDateColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Author } from '../author/author.entity';
import { Genre } from '../genre/genre.entity';
import { Review } from '../review/review.entity';
import { Chapter } from '../chapter/chapter.entity';

@Entity()
export class Novel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'varchar', nullable: true })
  coverUrl?: string;

  @Column({ default: false })
  isOriginal: boolean;

  @ManyToOne(() => Author, (author) => author.novels, { nullable: true })
  author?: Author | null;

  @Column()
  contributorId: string;

  @Column({ default: 0 })
  numberOfChapters: number;

  @Column({ default: 0 })
  numberOfPublishedChapters: number;

  @Column({ default: 0 })
  numberOfReviews: number;

  @Column({ default: 0 })
  totalReviewPoints: number;

  @Column({ default: 0 })
  numberOfVotes: number;

  @Column({ default: 0 })
  numberOfViews: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  averageRating: number;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date | null;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  latestPublishedChapterTime?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;

  @ManyToMany(() => Genre, (genre) => genre.novels, { cascade: true })
  @JoinTable({ name: 'novel_genre' })
  genres: Genre[];

  @OneToMany(() => Review, (review) => review.novel)
  reviews: Review[];

  @OneToMany(() => Chapter, (chapter) => chapter.novel)
  chapters: Chapter[];
}
