import { Module } from '@nestjs/common';
import { ConsumersController } from './consumers.controller';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/database/prisma.service';
import { ConsumersService, OllamaService } from './services';

@Module({
  imports: [HttpModule],
  controllers: [ConsumersController],
  providers: [ConsumersService, OllamaService, PrismaService],
})
export class ConsumersModule {}
