import { Repository } from 'typeorm';
import { Message } from '../core/entities/message.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

export const MESSAGE_REPOSITORY = Symbol('IMessageRepository');

export interface IMessagesRepository {
  findLatest(conversationId: string): Promise<Message[]>;
  save(message: Message): Promise<void>;
  exist(): Promise<boolean>;
}

@Injectable()
export class MessagesSqlRepository implements IMessagesRepository {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
  ) {}

  async exist(): Promise<boolean> {
    return await this.messageRepository.exist();
  }

  async save(message: Message): Promise<void> {
    await this.messageRepository.save(message);
  }

  async findLatest(conversationId: string): Promise<Message[]> {
    return await this.messageRepository.find({
      where: { conversationId },
      order: { createdAt: 'ASC' },
    });
  }
}
