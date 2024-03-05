import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
  Wait,
} from 'testcontainers';
import path = require('path');
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let environment: StartedDockerComposeEnvironment;

  beforeAll(async () => {
    const pathToCompose = path.resolve(__dirname, '..') + '/';
    console.log(pathToCompose);
    environment = await new DockerComposeEnvironment(
      pathToCompose,
      'compose.test.yaml',
    )
      .withWaitStrategy(
        'postgres_test',
        Wait.forLogMessage('database system is ready to accept connections', 1),
      )
      .withWaitStrategy(
        'qdrant_test',
        Wait.forLogMessage('Qdrant HTTP listening on 6333', 1),
      )
      .withBuild()
      .up();
  }, 15000);

  afterAll(async () => {
    await environment.down();
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/health (GET)', async () => {
    return request(app.getHttpServer())
      .get('/health')
      .set({
        'x-api-key': JSON.parse(process.env.API_KEYS)[0],
        Accept: 'application/json',
      })
      .expect(200);
  });
});
