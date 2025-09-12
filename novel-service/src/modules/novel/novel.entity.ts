import { Author } from 'src/modules/author/author.entity';
import { Chapter } from 'src/modules/chapter/chapter.entity';
import { Genre } from 'src/modules/genre/genre.entity';
import { Review } from 'src/modules/review/review.entity';
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

@Entity()
export class Novel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  coverUrl?: string;

  @Column({ default: false })
  isOriginal: boolean;

  @ManyToOne(() => Author, (author) => author.novels, { nullable: true })
  author?: Author;

  @Column()
  contributorId: string;

  @Column({ default: 0 })
  numberOfChapters: number;

  @Column({ default: 0 })
  numberOfPublishedChapters: number;

  @Column({ default: 0 })
  numberOfReviews: number;

  @Column({ default: 0 })
  numberOfVotes: number;

  @Column({ default: 0 })
  numberOfViews: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  averageRating: number;

  @Column({ default: false })
  isPublished: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @UpdateDateColumn()
  lastUpdatedAt: Date;

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
