import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/database/prisma.service";
import { EnrichmentService } from './enrichment.service';
import { HttpException } from '@nestjs/common';
import { LeadSource } from 'generated/prisma/enums';

describe('EnrichmentService', () => {
  let enrichmentService: EnrichmentService;

  const enrichmentId = crypto.randomUUID();
  const leadId = crypto.randomUUID();

  const mockPrismaService = {
    lead: {
      findUnique: vi.fn(),
    },
    enrichmentHistory: {
      findMany: vi.fn(),
    }
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnrichmentService, 
        { provide: PrismaService, useValue: mockPrismaService }
      ]
    }).compile();
    
    enrichmentService = module.get<EnrichmentService>(EnrichmentService);
  });
  
  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(enrichmentService).toBeDefined();
  });

  describe('enrichLead', () => {
    it('should returns Erro when lead not exists', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValueOnce(null);

      try {
        await enrichmentService.enrichLead(leadId);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Lead not found');
      }

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: leadId
        }
      });
    });    
  });

  describe('listEnrichs', () => {
    it('should returns Erro when lead not exists', async () => {
      const leadId = crypto.randomUUID();

      mockPrismaService.lead.findUnique.mockResolvedValueOnce(null);

      try {
        await enrichmentService.listEnrichs(leadId);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Lead not found');
      }

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: leadId
        }
      });

      expect(mockPrismaService.enrichmentHistory.findMany).toHaveBeenCalledTimes(0);
    });

    it('should be able to list a enrichments history', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValueOnce({
        id: leadId,
        fullName: 'Ricardo Souza',
        email: 'ricardo@quark.com.br',
        phone: '+5511999991111',
        companyName: 'Quark',
        companyCnpj: '12345678000199',
        source: LeadSource.OTHER,
      });

      mockPrismaService.enrichmentHistory.findMany.mockResolvedValueOnce([
        {
          id: enrichmentId,
          leadId,
          payload: '{}',
          status: "SUCCESS",
          errorMessage: null,
          requestedAt: new Date(),
          completedAt: new Date()
        }
      ]);

      const leads = await enrichmentService.listEnrichs(leadId);

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: leadId
        }
      });

      expect(mockPrismaService.enrichmentHistory.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.enrichmentHistory.findMany).toHaveBeenCalledWith({
        where: {
          leadId: leadId
        }
      });
      expect(leads).toEqual(expect.anything());
    });
  });
});