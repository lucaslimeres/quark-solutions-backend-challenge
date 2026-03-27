import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadsDto } from './dto/udpate-lead.dto';
import { LeadsService, EnrichmentService, ClassificationService} from './services';

@Controller('api/v1/leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly enrichmentService: EnrichmentService,
    private readonly classificationService: ClassificationService
  ) {}
  
  @Post()
  async create(@Body() createLeadDto: CreateLeadDto) {
    return await this.leadsService.create(createLeadDto);
  }

  @Get()
  async findAll() {
    const leads = await this.leadsService.findAll();
    return { leads };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.leadsService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadsDto) {
    return await this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.leadsService.remove(id);

    return {
      message: 'Lead deleted successfully'
    }
  }

  @Post(':id/enrichment')
  async enrich(@Param('id') id: string) {
    return await this.enrichmentService.enrichLead(id);
  }

  @Get(':id/enrichment')
  async listEnrichs(@Param('id') id: string) {
    const enrichments = await this.enrichmentService.listEnrichs(id);
    return { enrichments };
  }

  @Post(':id/classification')
  async classify(@Param('id') id: string) {
    return await this.classificationService.classifyLead(id);
  }

  @Get(':id/classification')
  async listClassifications(@Param('id') id: string) {
    const classifications = await this.classificationService.listClassifications(id);
    return { classifications };
  }

  @Get(':id/export')
  async export(@Param('id') id: string) {
    return { route: `/api/v1/leads/${id}/export`, method: 'GET', id };
  }
}
