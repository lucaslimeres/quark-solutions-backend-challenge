import { Test, TestingModule } from '@nestjs/testing';
import { LeadsController } from './leads.controller';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeadSource } from "generated/prisma/enums";
import { ClassificationService, EnrichmentService, ExportService, LeadsService } from './services';
import { v4 as uuvidv4 } from 'uuid';

describe('LeadsController', () => {
  let controller: LeadsController;
  let leadsService: LeadsService;
  let enrichmentService: EnrichmentService;
  let classificationService: ClassificationService;
  let exportService: ExportService;

  const mockLeadsService = {
    create: vi.fn(),
    findAll: vi.fn(),
    findOne: vi.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeadsController],
      providers: [
        { provide: LeadsService, useValue: mockLeadsService },
        { provide: EnrichmentService, useValue: mockEnrichmentService },
        { provide: ClassificationService, useValue: mockClassificationService },
        { provide: ExportService, useValue: mockExportService },
      ],
    }).compile();

    controller = module.get<LeadsController>(LeadsController);
    leadsService = module.get<LeadsService>(LeadsService);
    enrichmentService = module.get<EnrichmentService>(EnrichmentService);
    classificationService = module.get<ClassificationService>(ClassificationService);
    exportService = module.get<ExportService>(ExportService);
  });

  describe('create', () => {
    it('should be able to create a lead', async () => {
      const dto = {
        fullName: 'Ricardo Souza',
        email: 'ricardo@quark.com.br',
        phone: '+5511999991111',
        companyName: 'Quark',
        companyCnpj: '12345678000199',
        source: LeadSource.OTHER,
      } as any;

      mockLeadsService.create.mockResolvedValue({ id: '1', ...dto });

      const result = await controller.create(dto);

      expect(leadsService.create).toHaveBeenCalledWith(dto);
      expect(result).toHaveProperty('id');
    }); 
  });

  describe('export', () => {
    it('should be able to export leads', async () => {
      const filters = { classification: 'Hot' } as any;
      const leadId = uuvidv4();
      mockExportService.exportLeads.mockResolvedValue([]);

      await controller.export(leadId, filters);

      expect(exportService.exportLeads).toHaveBeenCalledWith(filters);
    });
  });
});