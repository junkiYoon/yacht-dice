import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Allow all origins so LAN clients can connect without CORS errors.
  // Override with CORS_ORIGIN env var to restrict in production.
  const corsOrigin = process.env.CORS_ORIGIN ?? '*';
  app.enableCors({ origin: corsOrigin });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🎲 Server running on http://0.0.0.0:${port}`);
}
bootstrap();
