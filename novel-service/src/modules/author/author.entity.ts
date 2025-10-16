import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Novel } from '../novel/novel.entity';

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  biography?: string;

  @OneToMany(() => Novel, (novel) => novel.author)
  novels: Novel[];
}
