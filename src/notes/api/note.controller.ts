import { Body, Controller, Put } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { NoteInputDto } from './dto/note-input.dto';
import { UpdateNoteCommand } from '../core/commands/updateNote.command';

@Controller('/notes')
export class NoteController {
  constructor(private readonly commandBus: CommandBus) {}

  @Put('/:id')
  async updateNote(@Body() body: NoteInputDto): Promise<void> {
    const command = new UpdateNoteCommand(body);
    return await this.commandBus.execute(command);
  }
}
