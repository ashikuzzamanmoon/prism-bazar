import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma';
import { CreateDeliveryZoneDto } from './dto/create-delivery-zone.dto';
import { UpdateDeliveryZoneDto } from './dto/update-delivery-zone.dto';

@Injectable()
export class DeliveryZonesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeliveryZoneDto) {
    return this.prisma.deliveryZone.create({
      data: {
        name: dto.name,
        area: dto.area,
        deliveryCharge: dto.deliveryCharge,
        estimatedTime: dto.estimatedTime,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
        sortOrder: dto.sortOrder !== undefined ? dto.sortOrder : 0,
      },
    });
  }

  async findAllActive() {
    return this.prisma.deliveryZone.findMany({
      where: {
        isActive: true,
        isDelete: false,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  async findAll() {
    return this.prisma.deliveryZone.findMany({
      where: {
        isDelete: false,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const zone = await this.prisma.deliveryZone.findFirst({
      where: { id, isDelete: false },
    });
    if (!zone) {
      throw new NotFoundException(`Delivery zone with ID ${id} not found`);
    }
    return zone;
  }

  async update(id: string, dto: UpdateDeliveryZoneDto) {
    await this.findOne(id);
    return this.prisma.deliveryZone.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.deliveryZone.update({
      where: { id },
      data: { isDelete: true },
    });
  }
}
