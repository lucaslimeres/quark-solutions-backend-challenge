import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/database/prisma.service";
import { HttpException } from '@nestjs/common';
import { LeadSource } from 'generated/prisma/enums';
import { ClassificationService } from './classification.service';

describe('ClassificationService', () => {
  let classificationService: ClassificationService;

  const classificationId = crypto.randomUUID();
  const leadId = crypto.randomUUID();

  const mockPrismaService = {
    lead: {
      findUnique: vi.fn(),
    },
    classificationHistory: {
      findMany: vi.fn(),
    }
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClassificationService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    classificationService = module.get<ClassificationService>(ClassificationService);
  });

  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(classificationService).toBeDefined();
  });

  describe('classifyLead', () => {
    it('should returns Erro when lead not exists', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValueOnce(null);

      try {
        await classificationService.classifyLead(leadId);
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

  describe('listClassifications', () => {
    it('should returns Erro when lead not exists', async () => {
      const leadId = crypto.randomUUID();

      mockPrismaService.lead.findUnique.mockResolvedValueOnce(null);

      try {
        await classificationService.listClassifications(leadId);
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

      expect(mockPrismaService.classificationHistory.findMany).toHaveBeenCalledTimes(0);
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

      mockPrismaService.classificationHistory.findMany.mockResolvedValueOnce([
        {
            id: classificationId,
            leadId: leadId,
            score: 0,
            classification: "",
            justification: "",
            commercialPotential: "",
            modelUsed: "",
            status: "SUCCESS",
            errorMessage: null,
            requestedAt: new Date(),
            completedAt: new Date()
        }
      ]);

      const leads = await classificationService.listClassifications(leadId);

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: leadId
        }
      });

      expect(mockPrismaService.classificationHistory.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.classificationHistory.findMany).toHaveBeenCalledWith({
        where: {
          leadId: leadId
        }
      });
      expect(leads).toEqual(expect.anything());
    });
  });
});