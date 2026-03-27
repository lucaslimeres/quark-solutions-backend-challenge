import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import 'dotenv/config';
import { LeadModel } from 'generated/prisma/models';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConsumersService {  
    constructor(
      private readonly httpService: HttpService,
      private readonly prisma: PrismaService
    ) {}

    logger = new Logger(ConsumersService.name); 

    async enrichLead(lead: LeadModel) {
        const { data: enrichData, status: statusCode } = await firstValueFrom(
            this.httpService.get(`${process.env.API_MOCK_URL}?companyCnpj=${lead.companyCnpj}`)
        );

        return await this.prisma.enrichmentHistory.create({
            data: {
                leadId: lead.id,
                payload: JSON.stringify(enrichData),
                requestedAt: lead.createdAt,
                completedAt: new Date(),
                errorMessage: statusCode === 200 ? null : JSON.stringify(enrichData),
                status: statusCode === 200 ? 'SUCCESS' : 'FAILED',
            },
        });
    }

    async classifyLead(lead: LeadModel) {
        return await this.prisma.classificationHistory.create({
            data: {
                leadId: lead.id,
                score: 0,
                classification: '',
                justification: '',
                commercialPotential: '',
                modelUsed: '',
                status: 'SUCCESS',
                requestedAt: lead.createdAt,
                completedAt: new Date(),
                errorMessage: null,
            },
        });
    }
}
