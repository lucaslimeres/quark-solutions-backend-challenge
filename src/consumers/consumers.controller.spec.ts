import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConsumersController } from './consumers.controller';
import { ConsumersService } from './services';
import { LeadModel } from 'generated/prisma/models';
import { RmqContext } from '@nestjs/microservices';
import { LeadSource } from 'generated/prisma/enums';

describe('ConsumersController', () => {
  let consumerController: ConsumersController;

  const context: RmqContext = {
    getChannelRef: () => ({
      ack: vi.fn(),
      nack: vi.fn(),
    }),
    getMessage: () => ({
      properties: {
        headers: {
          'x-death': [{ count: 0 }],
        },
      },
    }),
  } as unknown as RmqContext;

  const mockConsumersService = {
    enrichLead: vi.fn(),
    classifyLead: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsumersController],
      providers: [
        { provide: ConsumersService, useValue: mockConsumersService },
      ],
    }).compile();

    consumerController = module.get<ConsumersController>(ConsumersController);
  });

  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(consumerController).toBeDefined();
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

    await consumerController.enrichLead({ lead }, context);

    expect(mockConsumersService.enrichLead).toHaveBeenCalledTimes(1);
    expect(mockConsumersService.enrichLead).toHaveBeenCalledWith(lead);
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

    await consumerController.classifyLead({ lead }, context);

    expect(mockConsumersService.classifyLead).toHaveBeenCalledTimes(1);
    expect(mockConsumersService.classifyLead).toHaveBeenCalledWith(lead);
  });
});