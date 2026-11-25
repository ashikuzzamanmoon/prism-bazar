import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserQueryDto } from "./dto/user-query-dto";
import { PrismaService } from "src/prisma/prisma";
import { pagination } from "src/utils/pagination";
import { Prisma } from "generated/prisma/client";

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException("User already exists with this email");
    }

    const user = await this.prismaService.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email,
        phoneNumber: createUserDto.phoneNumber,
        password: createUserDto.password,
        address: createUserDto.address,
        bio: createUserDto.bio,
        profilePicture: createUserDto.profilePicture,
        gender: createUserDto.gender,
        country: createUserDto.country,
        city: createUserDto.city,
      },
    });

    return user;
  }

  async findAll(query: UserQueryDto) {
    const {
      page = 1,
      limit = 10,
      searchTerm,
      isActive,
      startDate,
      endDate,
    } = query;

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      isDeleted: false,
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(searchTerm
        ? {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { email: { contains: searchTerm, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(startDate || endDate
        ? {
            createdAt: {
              ...(startDate ? { gte: new Date(startDate) } : {}),
              ...(endDate ? { lte: new Date(endDate) } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prismaService.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prismaService.user.count({ where }),
    ]);

    return pagination(data, total, page, limit);
  }

  async remove(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return await this.prismaService.user.update({
      where: {
        id: id,
      },
      data: {
        isDeleted: true,
      },
    });
  }

  async getUserProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async getUserMyProfile(userId: string) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User profile not found");
    }

    return user;
  }

  async updateUserProfile(userId: string, updateUserDto: UpdateUserDto) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existingUser) {
        throw new BadRequestException("User already exists with this email");
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        name: updateUserDto.name,
        email: updateUserDto.email,
        phoneNumber: updateUserDto.phoneNumber,
        password: updateUserDto.password,
        address: updateUserDto.address,
        bio: updateUserDto.bio,
        profilePicture: updateUserDto.profilePicture,
        gender: updateUserDto.gender,
        country: updateUserDto.country,
        city: updateUserDto.city,
      },
    });

    return updatedUser;
  }
}
