import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadSource } from "generated/prisma/enums";
import { ClassificationService, EnrichmentService, ExportService, LeadsService } from './services';
import { CreateLeadDto, ExportFilterDto, UpdateLeadsDto } from './dto';

describe('LeadsController', () => {
  let leadController: LeadsController;

  const leadId = crypto.randomUUID();

  const mockLeadsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    enrich: vi.fn(),
    listEnrichs: vi.fn(),
    classify: vi.fn(),
    listClassifications: vi.fn(),
    exportLeads: vi.fn(),
  };

  const mockExportService = {
    exportLeads: vi.fn(),
  };
  
  const mockEnrichmentService = {
    enrichLead: vi.fn(),
    listEnrichs: vi.fn(),
  };
  
  const mockClassificationService = {
    classifyLead: vi.fn(),
    listClassifications: vi.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        { provide: LeadsService, useValue: mockLeadsService },
        { provide: EnrichmentService, useValue: mockEnrichmentService },
        { provide: ClassificationService, useValue: mockClassificationService },
        { provide: ExportService, useValue: mockExportService },
      ],
    }).compile();

    leadController = module.get<LeadsController>(LeadsController);
  });

  beforeEach(async () => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(leadController).toBeDefined();
  });

  it('should be able to create a lead', async () => {
    const leadDto: CreateLeadDto = {
      fullName: 'Ricardo Souza',
      email: 'ricardo@quark.com.br',
      phone: '+5511999991111',
      companyName: 'Quark',
      companyCnpj: '12345678000199',
      source: LeadSource.OTHER,
    };

    await leadController.create(leadDto);

    expect(mockLeadsService.create).toHaveBeenCalledTimes(1);
    expect(mockLeadsService.create).toHaveBeenCalledWith(leadDto);
  }); 

  it('should be able to list all leads', async () => {
    await leadController.findAll();

    expect(mockLeadsService.findAll).toHaveBeenCalledTimes(1);
    expect(mockLeadsService.findAll).toHaveBeenCalledWith();
  });

  it('should be able to find one lead', async () => {
    await leadController.findOne(leadId);

    expect(mockLeadsService.findOne).toHaveBeenCalledTimes(1);
    expect(mockLeadsService.findOne).toHaveBeenCalledWith(leadId);
  });

  it('should be able to update a lead', async () => {
    const updateLeadDto: UpdateLeadsDto = {
      fullName: 'Ricardo Souza',
      phone: '+5511999991111',
      companyName: 'Quark',
      source: LeadSource.OTHER,
    };

    await leadController.update(leadId, updateLeadDto);

    expect(mockLeadsService.update).toHaveBeenCalledTimes(1);
    expect(mockLeadsService.update).toHaveBeenCalledWith(leadId, updateLeadDto);
  });

  it('should be able to delete a lead', async () => {
    await leadController.remove(leadId);

    expect(mockLeadsService.remove).toHaveBeenCalledTimes(1);
    expect(mockLeadsService.remove).toHaveBeenCalledWith(leadId);
  });

  it('should be able to enrich a lead', async () => {
    await leadController.enrich(leadId);

    expect(mockEnrichmentService.enrichLead).toHaveBeenCalledTimes(1);
    expect(mockEnrichmentService.enrichLead).toHaveBeenCalledWith(leadId);
  });

  it('should be able to list enrichments of a lead', async () => {
    await leadController.listEnrichs(leadId);

    expect(mockEnrichmentService.listEnrichs).toHaveBeenCalledTimes(1);
    expect(mockEnrichmentService.listEnrichs).toHaveBeenCalledWith(leadId);
  });

  it('should be able to classify a lead', async () => {
    await leadController.classify(leadId);

    expect(mockClassificationService.classifyLead).toHaveBeenCalledTimes(1);
    expect(mockClassificationService.classifyLead).toHaveBeenCalledWith(leadId);
  });

  it('should be able to list classifications of a lead', async () => {
    await leadController.listClassifications(leadId);

    expect(mockClassificationService.listClassifications).toHaveBeenCalledTimes(1);
    expect(mockClassificationService.listClassifications).toHaveBeenCalledWith(leadId);
  });

  it('should be able to export a lead', async () => {
    const filters: ExportFilterDto = { 
      classification: 'Hot',
      startDate: new Date('2026-03-01').toDateString(),
      endDate: new Date('2026-03-31').toDateString(),
    };

    await leadController.export(leadId, filters);

    expect(mockExportService.exportLeads).toHaveBeenCalledTimes(1);
    expect(mockExportService.exportLeads).toHaveBeenCalledWith(leadId, filters);  
  });
});
