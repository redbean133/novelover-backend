import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Follow } from '../follow/follow.entity';

export const Gender = {
  Unknown: 0,
  Male: 1,
  Female: 2,
} as const;

export type Gender = (typeof Gender)[keyof typeof Gender];

export const UserRole = {
  Normal: 0,
  Admin: 1,
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const AccountStatus = {
  Normal: 0,
  SelfLocked: 1,
  AdminLocked: 2,
} as const;

export type AccountStatus = (typeof AccountStatus)[keyof typeof AccountStatus];
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 32,
    unique: true,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 32,
    nullable: false,
  })
  displayName: string;

  @Column({ type: 'varchar', length: 64, nullable: true })
  email?: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  passwordDigest: string;

  @Column({ type: 'varchar', length: 128, nullable: true, unique: true })
  providerId?: string;

  @Column({ type: 'varchar', length: 32, nullable: true })
  providerType?: string;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0: unknown, 1: male, 2: female',
  })
  gender: Gender;

  @Column({ type: 'timestamp', nullable: true })
  birthday?: Date | null;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column({ type: 'text', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'text', nullable: true })
  coverUrl?: string;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0: normal, 1: admin',
  })
  role: UserRole;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0: normal, 1: self-lock, 2: admin lock',
  })
  status: AccountStatus;

  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'now()',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'now()',
  })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;
}
