import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ConsumersModule } from './consumers/consumers.module';
import 'dotenv/config';

const logger = new Logger('Main');

async function bootstrap() {
  const consumer = await NestFactory.createMicroservice(ConsumersModule, {
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`],
      queue: 'lead_queue',
    }
  });

  await consumer.listen();
  logger.log('Consumer is running');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  
  await app.listen(process.env.PORT ?? 3000, () =>logger.log(`Server is running on port ${process.env.PORT ?? 3000}`));
}
bootstrap();
