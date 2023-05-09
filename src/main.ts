import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { urlencoded, json } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from 'nestjs-pino';

(async function () {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const port = app.get(ConfigService).get<number>('PORT');

  const handleShutdown = () => {
    app.close().then(() => {
      app.get(Logger).log('[Bootstrap] Server closed successfully.');
      process.exit(0);
    });
  };

  app.enableCors();
  app.useLogger(app.get(Logger));

  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors();
  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);

  await app.listen(port, '0.0.0.0', () => {
    app.get(Logger).log(`[Bootstrap] Server running on port: ${port} 🚀 ✨✨`);
  });
})();
