import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { environmentSetup } from './fixtures/enviroment.setup';
import { StartedDockerComposeEnvironment } from 'testcontainers';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let environment: StartedDockerComposeEnvironment;
  const timeoutForEnvironmentSetupInSeconds = 15 * 1000;

  beforeAll(async () => {
    environment = await environmentSetup();
  }, timeoutForEnvironmentSetupInSeconds);

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
