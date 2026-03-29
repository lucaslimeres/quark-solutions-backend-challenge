import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/database/prisma.service";
import { ExportFilterDto } from '../dto';
import { LeadSource } from 'generated/prisma/enums';
import { HttpException } from '@nestjs/common';
import { ExportService } from './export.service';
import { LeadModel } from 'generated/prisma/models';

describe('ExportService', () => {
  let exportService: ExportService;

  const leadId = crypto.randomUUID();

  const mockPrismaService = {
    lead: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    exportService = module.get<ExportService>(ExportService);
  });

  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(exportService).toBeDefined();
  });

  describe('exportLeads', () => {
    it('should returns Erro when lead not exists', async () => {
      const exportFilterDto: ExportFilterDto = { 
        classification: 'Hot',
        startDate: new Date('2026-03-01').toDateString(),
        endDate: new Date('2026-03-31').toDateString(),
      };

      const leadId = crypto.randomUUID();

      mockPrismaService.lead.findUnique.mockResolvedValueOnce(null);

      try {
        await exportService.exportLeads(leadId, exportFilterDto);
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

      expect(mockPrismaService.lead.findMany).toHaveBeenCalledTimes(0);
    });

    it('should be able to export a leads list', async () => {
      const exportFilterDto: ExportFilterDto = { 
        classification: 'Hot',
        startDate: new Date('2026-03-01').toDateString(),
        endDate: new Date('2026-03-31').toDateString(),
      };

      mockPrismaService.lead.findUnique.mockResolvedValueOnce({
        id: leadId,
        fullName: 'Ricardo Souza',
        email: 'ricardo@quark.com.br',
        phone: '+5511999991111',
        companyName: 'Quark',
        companyCnpj: '12345678000199',
        source: LeadSource.OTHER,
      });

      mockPrismaService.lead.findMany.mockResolvedValueOnce([
        
      ]);

      const leads = await exportService.exportLeads(leadId, exportFilterDto);

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: leadId
        }
      });

      expect(mockPrismaService.lead.findMany).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findMany).toHaveBeenCalledWith({
        where: {
          id: leadId,
          ...(exportFilterDto.classification && {
            classifications: {
              some: { classification: exportFilterDto.classification, status: 'SUCCESS' }
            }
          }),
          ...(exportFilterDto.startDate && exportFilterDto.endDate && {
            createdAt: {
              gte: new Date(exportFilterDto.startDate),
              lte: new Date(exportFilterDto.endDate),
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
      expect(leads).toEqual(expect.anything());
    });
  });
});