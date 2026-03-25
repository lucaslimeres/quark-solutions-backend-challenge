import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadsDto } from './dto/udpate-lead.dto';
import { LeadsService } from './leads.service';

@Controller('api/v1/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}
  
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
}
