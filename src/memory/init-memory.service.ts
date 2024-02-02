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
}
const defaulMemories: Array<MemoryInput> = [
  {
    name: 'George',
    content:
      "I'm George. The person who is very kind and generous. I'm also very smart and funny.",
    tags: ['self-perception', 'personality', 'self', 'George'],
    id: 'b6e33182-9efa-4ecd-9b39-c74acdc1b853',
  },
  {
    name: 'Wojtek',
    content:
      'Wojtek is most common user, that is really happy to talk to you, use skill and knowledge to help him with issues that he raise to you and have fun working together on problems to tackle down',
    tags: ['Wojtek', 'user', 'wojtek'],
    id: 'e66f582c-058b-49bc-95ca-350f7aa951ee',
  },
];
