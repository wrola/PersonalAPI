import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './core/note.entity';
import { SqlNoteRepository } from './infrastrucuture/note-sql.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  providers: [{ provide: 'NOTE_REPOSITORY', useClass: SqlNoteRepository }],
  exports: [],
})
export class NotesModule {}
