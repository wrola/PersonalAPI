import * as path from 'path';

import DatabaseConfigInterface from './interfaces/database.config';

export const config: DatabaseConfigInterface = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  entities: [path.join(__dirname, '../**/*.entity{.ts,.js}')],
  synchronize: false,
  migrationsRun: process.env.DATABASE_RUN_MIGRATIONS === 'true',
  migrations: [path.join(__dirname, 'migrations', '*{.ts,.js}')],
};
