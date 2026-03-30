import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { LeadModel } from 'generated/prisma/models';
import { firstValueFrom } from 'rxjs';
import { OllamaService } from './ollama.service';
import { ENVS } from 'src/utils/enviroments';

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
    
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${ENVS.API.MOCK_URL}?companyCnpj=${lead.companyCnpj}`)
      );
      
      return await this.prisma.enrichmentHistory.create({
        data: {
          leadId: lead.id,
          payload: response.data,
          requestedAt,
          completedAt: new Date(),
          status: 'SUCCESS',
        },
      });
    } catch (error) {
      await this.prisma.enrichmentHistory.create({
        data: {
          leadId: lead.id,
          requestedAt,
          completedAt: new Date(),
          errorMessage: error.message,
          status: 'FAILED',
        },
      });

      throw error; 
    }
  }

  async classifyLead(lead: LeadModel) {
    const classificationResult = await this.ollamaService.classifyLead(lead);

    const history = await this.prisma.classificationHistory.create({
        data: {
            leadId: lead.id,
            score: classificationResult.score,
            classification: classificationResult.classification,
            justification: classificationResult.justification,
            commercialPotential: classificationResult.commercialPotential,
            modelUsed: classificationResult.modelUsed,
            requestedAt: classificationResult.requestedAt,
            completedAt: classificationResult.completedAt,
            status: classificationResult.status,
            errorMessage: classificationResult.errorMessage,
        },
    });

    if (classificationResult.status === 'FAILED') {
        throw new Error(classificationResult.errorMessage);
    }

    return history;
  }
}
