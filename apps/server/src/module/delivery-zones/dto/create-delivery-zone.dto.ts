import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeliveryZoneDto {
  @ApiProperty({ description: 'Name of the zone, e.g. সিরাজগঞ্জ সদর, কাজিপুর' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Specific sub-area or union' })
  @IsOptional()
  @IsString()
  area?: string;

  @ApiProperty({ description: 'Delivery charge in BDT' })
  @IsNumber()
  deliveryCharge: number;

  @ApiPropertyOptional({ description: 'Estimated delivery time, e.g. সেম ডে, ১-২ দিন' })
  @IsOptional()
  @IsString()
  estimatedTime?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
