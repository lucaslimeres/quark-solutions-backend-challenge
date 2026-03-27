import { PrismaService } from "src/database/prisma.service";
import { ExportFilterDto } from "../dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";

@Injectable()
export class ExportService {
  constructor(private readonly prisma: PrismaService) {}

  async exportLeads(id: string, filters: ExportFilterDto) {
    const lead = await this.prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
    }

    const { classification, startDate, endDate } = filters;

    const leads = await this.prisma.lead.findMany({
      where: {
        id,
        ...(classification && {
          classifications: {
            some: { classification, status: 'SUCCESS' }
          }
        }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        })
      },
      include: {
        enrichments: {
          orderBy: { requestedAt: 'desc' },
          take: 1
        },
        classifications: {
          orderBy: { score: 'desc' },
          take: 1
        }
      }
    });

    return leads.map(lead => ({
      id: lead.id,
      fullName: lead.fullName,
      email: lead.email,
      company: lead.companyName,
      estimatedValue: lead.estimatedValue,
      lastEnrichment: lead.enrichments[0]?.payload || null,
      bestScore: lead.classifications[0]?.score || 0,
      currentStatus: lead.classifications[0]?.classification || 'PENDING',
      justification: lead.classifications[0]?.justification || '',
      modelUsed: lead.classifications[0]?.modelUsed || '',
      processedAt: lead.classifications[0]?.completedAt || null,
      createdAt: lead.createdAt
    }));
  }
}