import { Module } from '@nestjs/common';
import { ConsumersController } from './consumers.controller';
import { ConsumersService } from './consumers.service';
import { HttpModule } from '@nestjs/axios';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [ConsumersController],
  providers: [ConsumersService, PrismaService],
})
export class ConsumersModule {}
