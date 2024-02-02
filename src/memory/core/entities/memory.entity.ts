import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';
import { v4 } from 'uuid';

@Entity('memories')
export class Memory {
  @PrimaryColumn({ type: 'uuid', nullable: false })
  id: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  reflection: string | null;

  @Column({ type: 'jsonb' })
  tags: Array<string>;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'text' })
  name: string;

  static create(memoryInput: MemoryInput): Memory {
    const memory = new Memory();
    memory.id = memoryInput.id ? memoryInput.id : v4();
    memory.content = memoryInput.content;
    memory.name = memoryInput.name;
    memory.tags = memoryInput.tags;
    memory.active = true;
    memory.reflection = memoryInput.reflection ? memoryInput.reflection : null;

    return memory;
  }
}

export type MemoryInput = {
  content: string;
  name: string;
  tags: Array<string>;
  reflection?: string;
  id?: string;
};
