import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';

@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getRoot() {
    return {
      success: true,
      name: "Prism Bazar Backend API",
      status: "running",
      version: "1.0",
      docs: "http://localhost:9001/api/docs",
      adminDashboard: "http://localhost:3001/admin",
      webFrontend: "http://localhost:3000",
      timestamp: new Date().toISOString(),
    };
  }
}
