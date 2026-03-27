import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService, EnrichmentService, ClassificationService } from './services';
import { PrismaService } from 'src/database/prisma.service';
import { ExportService } from './services/export.service';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, EnrichmentService, ClassificationService, ExportService, PrismaService]
})
export class LeadsModule {}
