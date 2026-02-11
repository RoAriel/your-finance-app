import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { AnalyticsService } from './services/analytics.service';
import { ExportsService } from './services/exports.service';

@Module({
  controllers: [ReportsController],
  providers: [AnalyticsService, ExportsService],
})
export class ReportsModule {}
