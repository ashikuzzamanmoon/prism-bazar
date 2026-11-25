import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PrismaService } from 'src/prisma/prisma';

@Injectable()
export class RolesService {
  constructor(private readonly prismaService: PrismaService) { }


  async create(createRoleDto: CreateRoleDto) {
    const existing = await this.prismaService.role.findUnique({
      where: { name: createRoleDto.name },
    });

    if (existing) {
      throw new BadRequestException(`Role ${createRoleDto.name} already exists`);
    }
    return this.prismaService.role.create({
      data: createRoleDto,
    });
  }


  async findAll() {
    return this.prismaService.role.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prismaService.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return role;
  }


  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const role = await this.prismaService.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.prismaService.role.findUnique({
        where: { name: updateRoleDto.name },
      });
      if (existing) {
        throw new BadRequestException(`Role ${updateRoleDto.name} already exists`);
      }
    }

    return this.prismaService.role.update({
      where: { id },
      data: updateRoleDto,
    });
  }

  async remove(id: string) {
    const role = await this.prismaService.role.findUnique({ where: { id } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
    return this.prismaService.role.update({
      where: {
        id: role.id
      },
      data: {
        isDelete: true
      }
    });
  }
}
