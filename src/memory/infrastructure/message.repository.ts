import { Repository } from 'typeorm';
import { Message } from '../core/entities/message.entity';
import { Injectable } from '@nestjs/common';

export const MESSAGE_REPOSITORY = Symbol('IMessageRepository');

export interface IMessagesRepository {
  save(report: Message): Promise<Message>;
  findLatest(conversationId: string): Promise<Message[]>;
}
@Injectable()
export class MessagesRepository
  extends Repository<Message>
  implements IMessagesRepository
{
  findLatest(conversationId: string): Promise<Message[]> {
    return this.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }
}
