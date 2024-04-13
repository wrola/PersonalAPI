import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NoteInputDto } from '../../api/dto/note-inpu.dto';
import { Note } from '../note.entity';

export class UpdateNoteCommand {
  constructor(public readonly note: NoteInputDto) {}
}

@CommandHandler(UpdateNoteCommand)
export class UpdateNoteCommandHandler
  implements ICommandHandler<UpdateNoteCommand, void>
{
  async execute(command: UpdateNoteCommand) {
    // logic to update a note
    const { note } = command;
    const newNote = Note.create(note.title, note.content, 'main', []); // create or update
    return;
  }
}
