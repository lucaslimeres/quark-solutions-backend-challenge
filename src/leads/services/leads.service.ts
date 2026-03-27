import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateLeadDto } from '../dto/create-lead.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    return await this.prisma.lead.create({
      data: {
        id: crypto.randomUUID(),
        ...createLeadDto,
      }
    });
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

    return await this.prisma.lead.update({
      where: { id },
      data: updateLeadDto
    });
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
