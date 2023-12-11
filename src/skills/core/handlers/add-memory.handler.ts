import { Inject, Injectable } from '@nestjs/common';
import { SkillHandler } from './skill.handler';
import { IMemoryService, MEMORY_SERVICE } from '../../../memory/memory.service';
import { MemoryInput } from '../../../memory/core/entities/memory.entity';

@Injectable()
export class AddMemoryHandler implements SkillHandler {
  constructor(
    readonly payload: MemoryInput, // TODO ADD INPUT DTO
    @Inject(MEMORY_SERVICE) readonly memoryService: IMemoryService,
  ) {}
  async execute(): Promise<void> {
    await this.memoryService.add(this.payload);
  }
}
