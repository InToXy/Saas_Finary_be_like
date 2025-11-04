import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get('CORS_ORIGIN') || 'http://localhost:5173',
    credentials: true,
  });

  // Compression
  app.use(compression());

  // Global prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Wealth Management API')
      .setDescription('API de gestion de patrimoine SaaS')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentification et gestion de compte')
      .addTag('users', 'Gestion des utilisateurs')
      .addTag('accounts', 'Comptes financiers')
      .addTag('assets', 'Actifs')
      .addTag('transactions', 'Transactions')
      .addTag('alerts', 'Alertes')
      .addTag('subscriptions', 'Abonnements et paiements')
      .addTag('dashboard', 'Tableau de bord')
      .addTag('aggregation', 'Agrégation de données externes')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  console.log(`
    🚀 Application is running on: http://localhost:${port}/${apiPrefix}
    📚 Swagger docs: http://localhost:${port}/${apiPrefix}/docs
  `);
}

bootstrap();
