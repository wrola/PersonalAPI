import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';

@Entity('messages')
@Index(['conversationId', 'createdAt'])
export class Message {
  @PrimaryColumn({ type: 'uuid' })
  id: string;
  @Column({ nullable: false, type: 'uuid' })
  conversationId: string;
  @Column()
  human: string;
  @Column()
  ai: string;
  @Column({ default: true })
  active: boolean;
  @CreateDateColumn()
  createdAt: Date;
}
