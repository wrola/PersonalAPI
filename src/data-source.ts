import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Memory } from './memory/core/entities/memory.entity';
import { Message } from './memory/core/entities/message.entity';

export const dataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  synchronize: false,
  entities: [Memory, Message],
  migrations: ['dist/migration/*.js'],
});
