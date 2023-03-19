import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', {
    exclude: ['graphql'],
  });
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Sonar qube migrations and reporting')
    .setDescription(
      'This is a sonar qubemigration service via token auth and reporting generation',
    )
    .setVersion('1.0')
    .addTag('sonar qube')
    .addTag('reporting')
    .addTag('auth', 'needs auth')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(AppModule.port);
  const logger = new Logger();

  logger.log(`App bootstraped in http://[::]:${AppModule.port}`);
}
bootstrap();
