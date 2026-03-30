import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ConsumersModule } from './consumers/consumers.module';
import { ENVS } from './utils/enviroments';

const logger = new Logger('Main');

async function bootstrap() {
  const consumer = await NestFactory.createMicroservice(ConsumersModule, {
    transport: Transport.RMQ,
    options: {
      urls: [`amqp://${ENVS.RABBITMQ.USER}:${ENVS.RABBITMQ.PASSWORD}@${ENVS.RABBITMQ.HOST}:${ENVS.RABBITMQ.PORT}`],
      queue: ENVS.RABBITMQ.QUEUE,
      noAck: false,
      queueOptions: {
        durable: true,
      },
    }
  });

  await consumer.listen();
  logger.log('Consumer is running');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  
  await app.listen(ENVS.SERVER.PORT, () =>logger.log(`Server is running on port ${ENVS.SERVER.PORT}`));
}
bootstrap();
