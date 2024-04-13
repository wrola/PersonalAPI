import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './core/note.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Note])],
  providers: [],
  exports: [],
})
export class NotesModule {}
