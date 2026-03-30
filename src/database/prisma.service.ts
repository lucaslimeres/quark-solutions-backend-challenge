import { Injectable } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ENVS } from 'src/utils/enviroments';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({
      host: ENVS.DATABASE.HOST,
      port: Number(ENVS.DATABASE.PORT),
      user: ENVS.DATABASE.USER,
      password: ENVS.DATABASE.PASSWORD,
      database: ENVS.DATABASE.NAME,
    });
    super({ adapter });
  }
}
