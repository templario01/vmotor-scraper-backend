import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = app.get(ConfigService);
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
