import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { urlencoded, json } from 'express';
import { Logger } from '@nestjs/common';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';

(async function () {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'verbose', 'log', 'warn', 'debug'],
  });
  const port = app.get(ConfigService).get<number>('PORT');
  const logger = new Logger();
  const handleShutdown = () => {
    app.close().then(() => {
      logger.warn('[Bootstrap] Server closed successfully.');
      process.exit(0);
    });
  };

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors();
  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);

  await app.listen(port, '0.0.0.0', () => {
    logger.verbose(`[Bootstrap] Server running on port: ${port} 🚀 ✨✨`);
  });
})();
