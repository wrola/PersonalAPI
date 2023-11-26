import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

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
}
