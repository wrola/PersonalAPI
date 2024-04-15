import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NoteInputDto } from '../../api/dto/note-input.dto';
import { Note } from '../note.entity';

export class UpdateNoteCommand {
  constructor(public readonly note: NoteInputDto) {}
}

@CommandHandler(UpdateNoteCommand)
export class UpdateNoteCommandHandler
  implements ICommandHandler<UpdateNoteCommand, void>
{
  async execute(command: UpdateNoteCommand) {
    // TODO set local trigger to update from remote source
    const { note } = command;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newNote = Note.create(note.title, note.content, 'main', []); // create or update
    return;
  }
}
