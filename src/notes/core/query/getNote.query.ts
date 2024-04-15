import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NoteOutputDto } from '../../api/dto/note-output.dto';
import {
  INoteRepository,
  NOTE_REPOSITORY,
} from '../../infrastrucuture/note.repository';

export class GetNoteTagQuery implements IQuery {
  constructor(public readonly tag: string) {}
}

@QueryHandler(GetNoteTagQuery)
export class GetNoteQueryHandler
  implements IQueryHandler<GetNoteTagQuery, Array<NoteOutputDto>>
{
  constructor(
    @Inject(NOTE_REPOSITORY) private noteRepository: INoteRepository,
  ) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(query: GetNoteTagQuery): Promise<NoteOutputDto[]> {
    return [new NoteOutputDto()];
  }
}
