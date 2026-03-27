import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { LeadModel } from 'generated/prisma/models';
import { ConsumersService } from './consumers.service';

@Controller('consumers')
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) {}

  logger = new Logger(ConsumersController.name); 

  @EventPattern('enrich_lead')
  async enrichLead (@Payload() data: { lead: LeadModel}) {
    return await this.consumersService.enrichLead(data.lead);
  }

  @EventPattern('classify_lead')
  async classifyLead (@Payload() data: { lead: LeadModel}) {
    this.logger.log(`Classifying lead: ${JSON.stringify(data.lead)}`);

    return await this.consumersService.classifyLead(data.lead);
  }
}
