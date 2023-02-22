import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { urlencoded, json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.enableCors();
  await app.listen(config.get('PORT'));

  function handleShutdown() {
    console.log('Closing server gracefully...');
    app.close().then(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  }

  process.on('SIGINT', handleShutdown);
  process.on('SIGTERM', handleShutdown);
}
bootstrap();
