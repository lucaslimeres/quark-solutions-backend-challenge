import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService, EnrichmentService, ClassificationService } from './services';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, EnrichmentService, ClassificationService, PrismaService]
})
export class LeadsModule {}
