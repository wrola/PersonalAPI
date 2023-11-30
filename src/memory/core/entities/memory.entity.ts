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

  @Column({ type: 'text' })
  reflection: string;

  @Column({ type: 'jsonb' })
  tags: Array<string>;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'text' })
  source: string;

  static create(memoryInput: MemoryInput): Memory {
    const memory = new Memory();
    memory.id = v4();
    memory.content = memoryInput.content;
    memory.source = memoryInput.source;
    memory.tags = memoryInput.tags;
    memory.active = true;

    return memory;
  }
}

export type MemoryInput = {
  content: string;
  source: string;
  tags: Array<string>;
};
