import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', {
    exclude: ['graphql'],
  });
  app.enableCors();

  await app.listen(AppModule.port);
  const logger = new Logger();

  logger.log(`App bootstraped in http://[::]:${AppModule.port}`);
}
bootstrap();
