import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { urlencoded, json } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';

(async function () {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
    logger: ['error', 'verbose', 'log', 'warn'],
  });

  const port = app.get(ConfigService).get<number>('PORT');
  const logger = new Logger('Bootstrap');

  const handleShutdown = () => {
    app.close().then(() => {
      logger.warn('[Bootstrap] Server closed successfully.');
      process.exit(0);
    });
  };

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors();
  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);

  await app.listen(port, '0.0.0.0', () => {
    logger.log(`Server running on port: ${port} 🚀 ✨✨`);
  });
})();
