import { Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MemoryInput } from './core/entities/memory.entity';
import { AddMemoryCommand } from './core/commands/add-memory.comand';

export const INIT_MEMORY = Symbol('INITIAL_MEMORY');

export class InitialMemory {
  constructor(private readonly commandBus: CommandBus) {}

  async load() {
    const { content, name, tags, reflection, id } = defaultMemories[0];
    this.commandBus.execute(
      new AddMemoryCommand(content, name, tags, reflection, id),
    ),
      await Logger.log('Init memories added');
  }
}
const defaultMemories: Array<MemoryInput> = [
  {
    name: 'George',
    content:
      "I'm George. The person who is very kind and generous. I'm also very smart and funny.",
    tags: ['self-perception', 'personality', 'self', 'George'],
    id: 'b6e33182-9efa-4ecd-9b39-c74acdc1b853',
    reflection: 'self',
  },
  {
    name: 'Wojtek',
    content:
      'Wojtek is most common user, that is really happy to talk to you, use skill and knowledge to help him with issues that he raise to you and have fun working together on problems to tackle down',
    tags: ['Wojtek', 'user', 'wojtek'],
    id: 'e66f582c-058b-49bc-95ca-350f7aa951ee',
    reflection: 'self',
  },
];
