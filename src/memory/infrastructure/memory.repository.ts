import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Memory } from '../core/entities/memory.entity';

export const MEMORY_REPOSITORY = Symbol('IMemoryRepository');

export interface IMemoryRepository {
  findOne(id: string): Promise<Memory>;
  save(message: Memory): Promise<void>;
}

@Injectable()
export class MemorySqlRepository implements IMemoryRepository {
  constructor(
    @InjectRepository(Memory)
    private readonly memoryRepository: Repository<Memory>,
  ) {}

  async save(message: Memory): Promise<void> {
    await this.memoryRepository.save(message);
  }

  async findOne(id: string): Promise<Memory> {
    return await this.memoryRepository.findOne({ where: { id: id } });
  }
}
