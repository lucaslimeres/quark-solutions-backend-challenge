import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import 'dotenv/config';
import { LeadModel } from 'generated/prisma/models';
import { firstValueFrom } from 'rxjs';
import { OllamaService } from './ollama.service';
import { ProcessStatus } from 'generated/prisma/enums';

@Injectable()
export class ConsumersService {  
    constructor(
      private readonly httpService: HttpService,
      private readonly prisma: PrismaService,
      private readonly ollamaService: OllamaService,
    ) {}

    logger = new Logger(ConsumersService.name); 

    async enrichLead(lead: LeadModel) {
        const requestedAt = new Date();
        let status: ProcessStatus = 'SUCCESS';
        let errorMessage: string | null = null;
        let enrichData: string | null = null;

        try {
            const response = await firstValueFrom(
                this.httpService.get(`${process.env.API_MOCK_URL}?companyCnpj=${lead.companyCnpj}`)
            );
            
            enrichData = JSON.stringify(response.data);
        } catch (error) {
            this.logger.error(`Erro ao enriquecer lead: ${error.message}`);
            errorMessage = error.message;
            status = 'FAILED';
        }

        return await this.prisma.enrichmentHistory.create({
            data: {
                leadId: lead.id,
                payload: JSON.stringify(enrichData),
                requestedAt,
                completedAt: new Date(),
                errorMessage,
                status,
            },
        });
    }

    async classifyLead(lead: LeadModel) {
        const classificationResult = await this.ollamaService.classifyLead(lead);

        return await this.prisma.classificationHistory.create({
            data: {
                leadId: lead.id,
                score: classificationResult.score,
                classification: classificationResult.classification,
                justification: classificationResult.justification,
                commercialPotential: classificationResult.commercialPotential,
                modelUsed: classificationResult.modelUsed,
                status: classificationResult.status,
                requestedAt: classificationResult.requestedAt,
                completedAt: classificationResult.completedAt,
                errorMessage: classificationResult.status === 'FAILED' ? classificationResult.errorMessage : null,
            },
        });
    }
}
