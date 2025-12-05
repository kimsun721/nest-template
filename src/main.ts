import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { DocumentBuilder } from '@nestjs/swagger';
import { CustomExceptionFilter } from './common/filter/exception.filter';
import { TransformInterceptor } from './common/interceptor/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableShutdownHooks();
  app.useGlobalFilters(new CustomExceptionFilter());
  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.enableCors({
    origin: `${process.env.FRONT_URL}`,
    Credential: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('example')
    .setDescription('example')
    .setVersion('0.1')
    .build();

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
