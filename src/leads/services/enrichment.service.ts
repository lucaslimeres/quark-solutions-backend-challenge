import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";
import { PrismaService } from "src/database/prisma.service";
import { ENVS } from "src/utils/enviroments";

@Injectable()
export class EnrichmentService {
  private clientEnrichmentLead: ClientProxy

  constructor(private readonly prisma: PrismaService) {
    this.clientEnrichmentLead = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [`amqp://${ENVS.RABBITMQ.USER}:${ENVS.RABBITMQ.PASSWORD}@${ENVS.RABBITMQ.HOST}:${ENVS.RABBITMQ.PORT}`],
        queue: ENVS.RABBITMQ.QUEUE,
        queueOptions: {
          durable: true,
        },
      }
    });
  }

  async onModuleInit() {
    await this.clientEnrichmentLead.connect();
  }

  async enrichLead(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
    }

    try {
      return this.clientEnrichmentLead.emit('enrich_lead', { lead });
    } catch (error) {
      throw new HttpException('Erro ao enviar para fila', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async listEnrichs(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.enrichmentHistory.findMany({
      where: { leadId: id }
    });
  }
}