import {
  PrimaryGeneratedColumn,
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'jsonb', nullable: false })
  content: Record<string, unknown>;

  @Column()
  dir: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  tags: Array<string>;

  static create(
    title: string,
    content: Record<string, unknown>,
    dir: string,
    tags: Array<string>,
  ) {
    const note = new Note();
    note.title = title;
    note.content = content;
    note.dir = dir;
    note.tags = tags;
    return note;
  }
}
