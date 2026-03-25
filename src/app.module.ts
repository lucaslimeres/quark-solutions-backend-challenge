import { Module } from '@nestjs/common';
import { LeadsModule } from './leads/leads.module';

@Module({
  imports: [LeadsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
