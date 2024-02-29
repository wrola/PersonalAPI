import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
describe('AppController (e2e)', () => {
  let app: INestApplication;
  let startedContainer: StartedTestContainer;
  beforeAll(async () => {
    startedContainer = await new GenericContainer('alpine').start();
  });
  afterAll(async () => {
    await startedContainer.stop();
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
