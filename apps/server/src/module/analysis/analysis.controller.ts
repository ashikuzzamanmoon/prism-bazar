import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { API_VERSION } from 'src/utils/api-verstion';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Analysis')
@Controller({
  path: 'analysis',
  version: API_VERSION.V1,
})
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard analytics',
    description: 'Retrieve comprehensive dashboard analytics including products, orders, revenue, payments, and more',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard analytics fetched successfully',
  })
  async getDashboardAnalytics() {
    const data = await this.analysisService.getDashboardAnalytics();
    return {
      statusCode: HttpStatus.OK,
      message: 'Dashboard analytics fetched successfully',
      data,
    };
  }
}
