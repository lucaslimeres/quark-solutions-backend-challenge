import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";
import { PrismaService } from "src/database/prisma.service";
import 'dotenv/config';

@Injectable()
export class ClassificationService {
  private clientEnrichmentLead: ClientProxy

  constructor(private readonly prisma: PrismaService) {
    this.clientEnrichmentLead = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${process.env.RABBITMQ_USER}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`],
        queue: 'lead_queue',
      }
    });
  }

  async classifyLead(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
    }

    return this.clientEnrichmentLead.emit('classify_lead', { lead });
  }

  async listClassifications(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.classificationHistory.findMany({
      where: { leadId: id }
    });
  }
}