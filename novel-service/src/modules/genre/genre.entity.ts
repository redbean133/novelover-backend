import { Novel } from 'src/modules/novel/novel.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';

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
