import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<string>('PORT');
  const reflector = app.get( Reflector );
  // app.useGlobalGuards( new JwtAuthGuard( reflector ) );
  
  app.useStaticAssets(join(__dirname, '..', 'public')); // truy cập js, css, images
  app.setBaseViewsDir(join(__dirname, '..', 'views'));  // views
  app.setViewEngine('ejs');
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(port);
}
bootstrap();
