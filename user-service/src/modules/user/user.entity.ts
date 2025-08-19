import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

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
    length: 64,
    nullable: true,
  })
  displayName: string;

  @Column({ type: 'varchar', length: 64, unique: true, nullable: true })
  email: string | null;

  @Column({
    type: 'varchar',
    length: 64,
    nullable: true,
  })
  passwordDigest: string;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0: unknown, 1: male, 2: female',
  })
  gender: number;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0: normal, 1: admin',
  })
  role: number;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0: normal, 1: self-lock, 2: admin lock',
  })
  status: number;

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
