import 'reflect-metadata';
import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { Memory } from './memory/core/entities/memory.entity';
import { Message } from './memory/core/entities/message.entity';
import { Skill } from './skills/core/skill.entity';
import path = require('path');

export const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: 5433,
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'test',
  entities: [Memory, Message, Skill],
  migrationsRun: true,
  migrations: [path.join(__dirname, 'migration', '*{.ts,.js}')],
});
