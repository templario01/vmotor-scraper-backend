import { configureTestApplicationForSuccessScenarios } from './src/integration-tests/test-utils/integration-tests.utils';
import { PrismaService } from './src/persistence/services/prisma.service';

jest.setTimeout(300000);

global.beforeAll(async () => {
  const testApp = await configureTestApplicationForSuccessScenarios();

  await testApp.init();

  global.prisma = global.prisma || new PrismaService();
  global.testApp = testApp;
});

global.afterAll(async () => {
  await global.testApp.close();
  await global.prisma.clearDatabase();
  await global.prisma.$disconnect();
});

global.afterEach(() => {
  jest.clearAllMocks();
});
