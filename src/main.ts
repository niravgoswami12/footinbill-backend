import { config } from 'dotenv';
config();
require('newrelic');
import * as Sentry from '@sentry/node';
// or use es6 import statements
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
const PORT = process.env.PORT || 3000;
Sentry.init({
  dsn: 'https://04c73bf107db4bea87454da31bdbf2b0@o4504566770827264.ingest.sentry.io/4504566780461056',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);
}

bootstrap();
