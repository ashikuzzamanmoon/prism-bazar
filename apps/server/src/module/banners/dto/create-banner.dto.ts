import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUrl,
} from "class-validator";
import { BannerType } from "generated/prisma/enums";

export class CreateBannerDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsString()
    @IsOptional()
    link: string;

    @IsString()
    @IsOptional()
    description?: string;

    // @IsUrl()
    @IsString()
    @IsOptional()
    image: string;

    @IsString()
    @IsOptional()
    video: string;


    @IsEnum(BannerType)
    type?: BannerType


    @IsBoolean()
    @IsOptional()
    isPublish?: boolean = false;
}


export class PublishBannerDto {
    @IsBoolean()
    @IsOptional()
    publish: boolean;

    @IsBoolean()
    @IsOptional()
    side?: boolean;
}