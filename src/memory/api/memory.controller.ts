import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MemoryOutputDto } from './dto/memory-output.dto';
import { MemoryInputDto } from './dto/memory-input.dto';
import { AddMemoryCommand } from '../core/commands/add-memory.command';

@Controller()
export class MemoryController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/memories')
  async learn(@Body() body: MemoryInputDto): Promise<MemoryOutputDto> {
    const { content, name, tags } = body;
    return await this.commandBus.execute(
      new AddMemoryCommand(content, name, tags),
    );
  }
}
