import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConsumersService } from './consumers.service';
import { PrismaService } from 'src/database/prisma.service';
import { HttpService } from '@nestjs/axios';
import { OllamaService } from './ollama.service';
import { LeadSource } from 'generated/prisma/enums';
import { LeadModel } from 'generated/prisma/models';
import { of } from 'rxjs';

describe('ConsumersService', () => {
  let consumersService: ConsumersService;

  const mockPrismaService = {
    enrichmentHistory: {
      create: vi.fn().mockResolvedValue({}),
    },
    classificationHistory: {
      create: vi.fn().mockResolvedValue({}),
    },
  };

  const mockHttpService = {
    get: vi.fn().mockReturnValue(of({ data: { enrichedData: 'some enriched data' } })),
  };

  const mockOllamaService = {
    classifyLead: vi.fn().mockResolvedValue({
      score: 0.8,
      classification: 'HIGH',
      justification: 'Lead has a high estimated value and is from a reputable company.',
      commercialPotential: 'HIGH',
    }),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsumersService, 
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: OllamaService, useValue: mockOllamaService },
      ],
    }).compile();

    consumersService = module.get<ConsumersService>(ConsumersService);
  });

  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(consumersService).toBeDefined();
  });

  it('should be able to enrich a lead', async () => {
    const lead: LeadModel = {
      id: 'lead-id',
      fullName: 'Lead Name',
      email: 'lead@email.com',
      phone: '',
      companyCnpj: '',
      companyName: '',
      companyWebsite: '',
      notes: '',
      estimatedValue: 0,
      source: LeadSource.OTHER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }; 

    await consumersService.enrichLead(lead);

    expect(mockHttpService.get).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.enrichmentHistory.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.enrichmentHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          leadId: lead.id,
          status: 'SUCCESS',
        }),
      }),
    );
  });

  it('should be able to classify a lead', async () => {
    const lead: LeadModel = {
      id: 'lead-id',
      fullName: 'Ricardo Souza',
      email: 'ricardo@quark.com.br',
      phone: '+5511999991111',
      companyName: 'Quark',
      companyCnpj: '12345678000199',
      companyWebsite: 'https://quark.com.br',
      notes: '',
      estimatedValue: 100,
      source: LeadSource.OTHER,
      createdAt: new Date(),
      updatedAt: new Date(),
    }; 

    await consumersService.classifyLead(lead);

    expect(mockOllamaService.classifyLead).toHaveBeenCalledTimes(1);
    expect(mockOllamaService.classifyLead).toHaveBeenCalledWith(lead);

    expect(mockPrismaService.classificationHistory.create).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.classificationHistory.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          leadId: lead.id,
          score: 0.8,
        }),
      }),
    );
  });
});