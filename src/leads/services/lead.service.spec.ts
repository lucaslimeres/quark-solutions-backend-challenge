import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadsService } from "./leads.service";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "src/database/prisma.service";
import { CreateLeadDto, UpdateLeadsDto } from '../dto';
import { LeadSource } from 'generated/prisma/enums';
import { HttpException } from '@nestjs/common';

describe('LeadsService', () => {
  let leadsService: LeadsService;

  const leadId = crypto.randomUUID();

  const mockPrismaService = {
    lead: {
      create: vi.fn().mockResolvedValue({
        id: leadId,
        fullName: 'Ricardo Souza',
        email: 'ricardo@quark.com.br',
        phone: '+5511999991111',
        companyName: 'Quark',
        companyCnpj: '12345678000199',
        source: LeadSource.OTHER,
      }),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    leadsService = module.get<LeadsService>(LeadsService);
  });

  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(leadsService).toBeDefined();
  });

  describe('create', () => {
    it('should returns Erro when lead already exists', async () => {
      const createLeadDto: CreateLeadDto = {
        fullName: 'Ricardo Souza',
        email: 'ricardo@quark.com.br',
        phone: '+5511999991111',
        companyName: 'Quark',
        companyCnpj: '12345678000199',
        source: LeadSource.OTHER,
      };

      mockPrismaService.lead.findFirst.mockResolvedValueOnce({
        id: crypto.randomUUID(),
        ...createLeadDto,
      });

      try {
        await leadsService.create(createLeadDto);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Lead already exists with this email or company CNPJ');
      }

      expect(mockPrismaService.lead.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: createLeadDto.email },
            { companyCnpj: createLeadDto.companyCnpj }
          ]
        },
      });

      expect(mockPrismaService.lead.create).toHaveBeenCalledTimes(0);
    });

    it('should be able to create a lead', async () => {
      const createLeadDto: CreateLeadDto = {
        fullName: 'Ricardo Souza',
        email: 'ricardo@quark.com.br',
        phone: '+5511999991111',
        companyName: 'Quark',
        companyCnpj: '12345678000199',
        source: LeadSource.OTHER,
      };

      mockPrismaService.lead.findFirst.mockResolvedValueOnce(null);

      await leadsService.create(createLeadDto);

      expect(mockPrismaService.lead.findFirst).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: createLeadDto.email },
            { companyCnpj: createLeadDto.companyCnpj }
          ]
        },
      });

      expect(mockPrismaService.lead.create).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          ...createLeadDto,
        }
      });
    });
  });

  it('should returns all Leads', async () => {
    const createLeadDto: CreateLeadDto = {
      fullName: 'Ricardo Souza',
      email: 'ricardo@quark.com.br',
      phone: '+5511999991111',
      companyName: 'Quark',
      companyCnpj: '12345678000199',
      source: LeadSource.OTHER,
    };

    mockPrismaService.lead.findMany.mockResolvedValueOnce([createLeadDto]);

    const leads = await leadsService.findAll();

    expect(leads).toEqual(expect.objectContaining([createLeadDto]));
    expect(mockPrismaService.lead.findMany).toHaveBeenCalledTimes(1);
    expect(mockPrismaService.lead.findMany).toHaveBeenCalledWith(); 
  });

  describe('findOne', () => {
      it('should returns Erro when lead not exists', async () => {
      const newLeadId = crypto.randomUUID();

      mockPrismaService.lead.findUnique.mockResolvedValueOnce(null);

      try {
        await leadsService.findOne(newLeadId);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Lead not found');
      }

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: newLeadId
        }
      });
    });

    it('should returns one Leads', async () => {
      const createLeadDto: CreateLeadDto = {
        fullName: 'Ricardo Souza',
        email: 'ricardo@quark.com.br',
        phone: '+5511999991111',
        companyName: 'Quark',
        companyCnpj: '12345678000199',
        source: LeadSource.OTHER,
      };

      mockPrismaService.lead.findUnique.mockResolvedValueOnce(createLeadDto);

      const lead = await leadsService.findOne(leadId);

      expect(lead).toEqual(createLeadDto);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({ where: { id: expect.any(String) } });
    });
  });

  describe('update', () => {
    it('should returns Erro when lead not exists', async () => {
      const updateLeadDto: UpdateLeadsDto = {
        fullName: 'Ricardo Souza',
        phone: '+5511999991111',
        companyName: 'Quark',
        source: LeadSource.OTHER,
      };

      const newLeadId = crypto.randomUUID();

      mockPrismaService.lead.findUnique.mockResolvedValueOnce(null);

      try {
        await leadsService.update(newLeadId, updateLeadDto);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Lead not found');
      }

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: newLeadId
        }
      });

      expect(mockPrismaService.lead.update).toHaveBeenCalledTimes(0);
    });

    it('should be able to update a lead', async () => {
      const updateLeadDto: UpdateLeadsDto = {
        fullName: 'Ricardo Souza',
        phone: '+5511999991111',
        companyName: 'Quark',
        source: LeadSource.OTHER,
      };

      mockPrismaService.lead.findUnique.mockResolvedValueOnce({
        where: { id: leadId }
      });

      await leadsService.update(leadId, updateLeadDto);

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: leadId
        }
      });

      expect(mockPrismaService.lead.update).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.update).toHaveBeenCalledWith({
        where: {
          id: leadId
        },
        data: {
          ...updateLeadDto
        }
      });
    });
  });

  describe('delete', () => {
    it('should returns Erro when lead not exists', async () => {
      const newLeadId = crypto.randomUUID();

      mockPrismaService.lead.findUnique.mockResolvedValueOnce(null);

      try {
        await leadsService.remove(newLeadId);
        throw new Error('Error');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Lead not found');
      }

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: newLeadId
        }
      });

      expect(mockPrismaService.lead.delete).toHaveBeenCalledTimes(0);
    });

    it('should be able to delete a lead', async () => {
      mockPrismaService.lead.findUnique.mockResolvedValueOnce({
        where: { id: leadId }
      });

      await leadsService.remove(leadId);

      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.findUnique).toHaveBeenCalledWith({
        where: {
          id: leadId
        }
      });

      expect(mockPrismaService.lead.delete).toHaveBeenCalledTimes(1);
      expect(mockPrismaService.lead.delete).toHaveBeenCalledWith({
        where: {
          id: leadId
        }
      });
    });
  });
});