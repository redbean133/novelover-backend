import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';

export enum CommentTargetType {
  NOVEL = 'novel',
  CHAPTER = 'chapter',
}

@Entity('comments')
@Index(['targetType', 'targetId', 'createdAt'])
@Index(['parentId', 'createdAt'])
@Index(['userId'])
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  userId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: CommentTargetType,
  })
  targetType: CommentTargetType;

  @Column({ type: 'int' })
  targetId: number; // novelId or chapterId

  // Parent comment ID - null if root comment
  @Column({ type: 'int', nullable: true })
  parentId: number | null;

  @Column({ type: 'int', nullable: true })
  rootId: number | null;

  @Column({ type: 'int', default: 0 })
  repliesCount: number;

  @Column({ type: 'int', default: 0 })
  likesCount: number;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Comment, (comment) => comment.replies, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  parent: Comment;

  @OneToMany(() => Comment, (comment) => comment.parent)
  replies: Comment[];

  limitedReplies?: Comment[];
  hasMoreReplies?: boolean;
}
