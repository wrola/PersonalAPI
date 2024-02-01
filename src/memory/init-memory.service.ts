import { Inject, Logger } from '@nestjs/common';
import { IMemoryService, MEMORY_SERVICE } from './memory.service';
import { MemoryInput } from './core/entities/memory.entity';

export const INIT_MEMORY = Symbol('INITIAL_MEMORY');

export class InitialMemory {
  constructor(@Inject(MEMORY_SERVICE) private service: IMemoryService) {}
  async load() {
    await Promise.all(
      defaulMemories.map(async (memory) => await this.service.add(memory)),
    );
    Logger.log('Init memories added');
  }
} // TODO make it one-timer
const defaulMemories: Array<MemoryInput> = [
  {
    name: 'George',
    content:
      "I'm George. The person who is very kind and generous. I'm also very smart and funny.",
    tags: ['self-perception', 'personality', 'self', 'George'],
  },
  {
    name: 'Wojtek',
    content:
      'Wojtek is most common user, that is really happy to talk to you, use skill and knowledge to help him with issues that he raise to you and have fun working together on problems to tackle down',
    tags: ['Wojtek', 'user', 'wojtek'],
  },
];
