import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const PORT = process.env.PORT || 8080;

  app.use('/.well-known/pki-validation', express.static('./static'));

  await app
    .listen(PORT)
    .then(() => console.log(`App is listening on port ${PORT}`));
}
bootstrap();
