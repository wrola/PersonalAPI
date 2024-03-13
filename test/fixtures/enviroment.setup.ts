import path = require('path');
import { DockerComposeEnvironment, Wait } from 'testcontainers';

export const environmentSetup = async () => {
  const pathToCompose = path.resolve(__dirname, '../..') + '/';

  return await new DockerComposeEnvironment(pathToCompose, 'compose.test.yaml')
    .withWaitStrategy(
      'qdrant_test',
      Wait.forLogMessage('Qdrant HTTP listening on 6333', 1),
    )
    .withWaitStrategy(
      'postgres_test',
      Wait.forLogMessage('database system is ready to accept connections', 2),
    )
    .withBuild()
    .up();
};
