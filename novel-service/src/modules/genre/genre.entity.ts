import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Novel } from '../novel/novel.entity';

@Entity()
export class Genre {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description?: string;

  @ManyToMany(() => Novel, (novel) => novel.genres)
  novels: Novel[];
}
