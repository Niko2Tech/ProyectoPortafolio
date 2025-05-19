import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.setGlobalPrefix('api');
  const config = new DocumentBuilder()
    .setTitle('Ferreteria Carlito')
    .setDescription('Aplicacion de gestion de inventario y ventas')
    .setVersion('1.0')
    .addTag('Api de Ferreteria')
    .addCookieAuth('access_token', {
      type: 'http',
    })
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 8080);
}
bootstrap();
