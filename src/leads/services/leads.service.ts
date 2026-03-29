import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  logger = new Logger(LeadsService.name);

  async create(createLeadDto: CreateLeadDto) {
    const lead = await this.prisma.lead.findFirst({
      where: {
        OR: [
          { email: createLeadDto.email },
          { companyCnpj: createLeadDto.companyCnpj }
        ]
      },
    });

    if (lead) {
      throw new HttpException('Lead already exists with this email or company CNPJ', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.prisma.lead.create({
        data: {
          id: crypto.randomUUID(),
          ...createLeadDto,
        }
      });
    } catch (error) {
      this.logger.error('Error creating lead', error);
      throw new HttpException('Error creating lead', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll() {
    return await this.prisma.lead.findMany();
  }

  async findOne(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
    }

    return lead;
  }

  async update(id: string, updateLeadDto: any) {
    const lead = await this.prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
    }

    try {
      return await this.prisma.lead.update({
        where: { id },
        data: updateLeadDto
      })
    } catch(error) {
      this.logger.error('Error updating lead', error);
      throw new HttpException('Error updating lead', HttpStatus.INTERNAL_SERVER_ERROR);
    };
  }

  async remove(id: string) {
    const lead = await this.prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      throw new HttpException('Lead not found', HttpStatus.NOT_FOUND);
    }

    return await this.prisma.lead.delete({
      where: { id }
    });
  }
}
