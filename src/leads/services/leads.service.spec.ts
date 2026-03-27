import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../../database/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadSource } from "generated/prisma/enums";

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: PrismaService;
  let client: ClientProxy;

  const mockPrisma = {
    lead: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  };

  const mockClientProxy = {
    emit: vi.fn().mockReturnValue({ toPromise: () => Promise.resolve() }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: 'LEAD_PACKAGE', useValue: mockClientProxy },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    prisma = module.get<PrismaService>(PrismaService);
    client = module.get<ClientProxy>('LEAD_PACKAGE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a lead and emit an enrichment event', async () => {
      const dto = {
        fullName: 'Lucas Limeres',
        email: 'lucas@test.com',
        phone: '+5511999991111',
        companyName: 'Quark Solutions',
        companyCnpj: '12345678000199',
        source: LeadSource.PAID_ADS,
      };

      const createdLead = { id: 'uuid-123', ...dto };
      mockPrisma.lead.create.mockResolvedValue(createdLead);

      const result = await service.create(dto);

      expect(prisma.lead.create).toHaveBeenCalledWith({ data: dto });
      expect(client.emit).toHaveBeenCalledWith('enrich_lead', { lead: createdLead });
      expect(result).toEqual(createdLead);
    });

    it('should throw an error if the email already exists', async () => {
      mockPrisma.lead.create.mockRejectedValue({ code: 'P2002' }); // Erro de Unique do Prisma

      await expect(service.create({} as any)).rejects.toThrow();
    });
  });
});