import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Novel } from '../novel/novel.entity';

@Entity()
@Index(['novelId', 'userId'], { unique: true })
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  novelId: number;

  @ManyToOne(() => Novel, (novel) => novel.reviews, { onDelete: 'CASCADE' })
  novel: Novel;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'int' })
  rating: number; // 1 - 5 stars

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
