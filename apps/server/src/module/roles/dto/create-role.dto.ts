import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { RoleType } from 'generated/prisma/enums';

export class CreateRoleDto {
    @ApiProperty({
        description: 'Role name, must be one of RoleType enum',
        enum: RoleType,
        example: RoleType.ADMIN,
    })
    @IsEnum(RoleType, { message: 'Role must be a valid RoleType' })
    name: RoleType;
}
