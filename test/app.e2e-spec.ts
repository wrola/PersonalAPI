import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import {
  DockerComposeEnvironment,
  StartedDockerComposeEnvironment,
} from 'testcontainers';
import path = require('path');
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let environment: StartedDockerComposeEnvironment;

  beforeAll(async () => {
    console.log(path.resolve(__dirname, '..'));
    environment = await new DockerComposeEnvironment(
      path.resolve(__dirname, '..'),
      'compose.test.yaml',
    )
      .withBuild()
      .up();
  });

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
