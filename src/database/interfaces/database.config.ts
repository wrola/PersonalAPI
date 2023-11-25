export default interface DatabaseConfigInterface {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  entities: Array<string>;
  synchronize: boolean;
  migrationsRun: boolean;
  migrations: Array<string>;
}
