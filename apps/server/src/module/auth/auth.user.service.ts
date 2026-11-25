import { Injectable, BadRequestException } from '@nestjs/common';
import { OtpType, RoleType } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma';

@Injectable()
export class UserAuthService {
    constructor(private readonly prisma: PrismaService) { }

    generateOtp(): string {
        return Math.floor(1000 + Math.random() * 9000).toString();
    }

    getExpiry(minutes = 3): Date {
        return new Date(Date.now() + minutes * 60 * 1000);
    }

    async createUserWithDefaultRole(
        tx: any,
        phoneNumber: string,

    ) {
        const user = await tx.user.create({
            data: {
                phoneNumber,
                isActive: true,
            },
        });

        const role = await tx.role.findUnique({
            where: { name: RoleType.USER },
        });

        if (!role) {
            throw new BadRequestException('Default role USER not found');
        }

        await tx.userRole.create({
            data: {
                userId: user.id,
                roleId: role.id,
            },
        });

        return user;
    }


    async createOtp(
        tx: any,
        userId: string,
        target: string,
        type: OtpType,
    ) {
        const code = this.generateOtp();

        await tx.otp.create({
            data: {
                userId,
                target,
                type,
                code,
                expiresAt: this.getExpiry(),
            },
        });

        return code;
    }
}
