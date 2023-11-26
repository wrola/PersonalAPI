import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryColumn,
} from 'typeorm';
import { v4 } from 'uuid';

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

  static create(conversationId: string, human: string, ai: string): Message {
    const message = new Message();
    message.id = v4();
    message.conversationId = conversationId;
    message.ai = ai;
    message.human = human;
    return message;
  }
}
