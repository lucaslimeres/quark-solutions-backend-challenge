import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { ConsumersService } from './services';
import { LeadModel } from 'generated/prisma/models';
import 'dotenv/config';

@Controller('consumers')
export class ConsumersController {
  constructor(private readonly consumersService: ConsumersService) {}

  logger = new Logger(ConsumersController.name);
  maxRetries = parseInt(process.env.RABBITMQ_MAX_RETRIES || '5');

  @MessagePattern('enrich_lead')
  async enrichLead(@Payload() data: { lead: LeadModel }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const headers = originalMsg.properties.headers;
    const deathCount = headers['x-death']?.[0]?.count || 0;

    if (deathCount >= this.maxRetries) {
      this.logger.error(`Lead ${data.lead.id} falhou ${this.maxRetries} vezes ao tentar enriquecer. Movendo para logs finais.`);
      channel.ack(originalMsg);
      return;
    }

    try {
      await this.consumersService.enrichLead(data.lead);
      channel.ack(originalMsg);
    } catch (error) {
      channel.nack(originalMsg, false, true); 
    }
  }

  @MessagePattern('classify_lead')
  async classifyLead(@Payload() data: { lead: LeadModel }, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const headers = originalMsg.properties.headers;
    const deathCount = headers['x-death']?.[0]?.count || 0;

    if (deathCount >= this.maxRetries) {
      this.logger.error(`Lead ${data.lead.id} falhou ${this.maxRetries} vezes ao tentar classificar. Movendo para logs finais.`);
      channel.ack(originalMsg);
      return;
    }

    try {
      await this.consumersService.classifyLead(data.lead);
      channel.ack(originalMsg);
    } catch (error) {
      channel.nack(originalMsg, false, true);
    }
  }
}