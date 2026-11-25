import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { BannersService } from "./banners.service";
import { CreateBannerDto, PublishBannerDto } from "./dto/create-banner.dto";
import { API_VERSION } from "src/utils/api-verstion";
import { UpdateBannerDto } from "./dto/update-banner.dto";
import { BannerQueryDto } from "./dto/banner-query-dto";


@Controller({
  path: "banners",
  version: API_VERSION.V1,
})
export class BannersController {
  constructor(private readonly bannersService: BannersService) { }

  @Post()
  async createBanner(@Body() createBannerDto: CreateBannerDto) {
    const result = await this.bannersService.createNewBanner(createBannerDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Banner created successfully!",
      data: result,
    };
  }

  @Get()
  async findAll(@Query() query: BannerQueryDto) {
    const result = await this.bannersService.getAllBanner(query);
    return {
      statusCode: HttpStatus.OK,
      message: "Banner retrieved successfully",
      data: result,
    };
  }

  @Get("query")
  async findAllQuery() {
    const result = await this.bannersService.getAllQueryBanner();
    return {
      statusCode: HttpStatus.OK,
      message: "Banner retrieved successfully",
      data: result,
    };
  }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log("Fetching banner with ID:", id);
    const result = await this.bannersService.findSingleBanner(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Banner retrieved successfully !",
      data: result,
    };
  }

  @Patch(':id')

  async updateBanner(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto
  ) {
    const result = await this.bannersService.updateSingleProduct(
      id,
      updateBannerDto
    );
    return {
      statusCode: HttpStatus.OK,
      message: "Banner update successfully",
      data: result,
    };
  }

  @Delete(":id")
  async deleteBanner(@Param("id") id: string) {
    const result = await this.bannersService.deleteBanner(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Banner Delete Successfully!",
      data: result,
    };
  }

  @Patch("publish/:id")

  async publishBanner(@Param('id') id: string, @Body() data: PublishBannerDto) {
    const result = await this.bannersService.publishBanner(id, data);
    return {
      statusCode: HttpStatus.OK,
      message: "Banner update successfully!",
      data: result
    }
  }


  @Patch("publish-sidebar/:id")

  async publishBannerSide(@Param('id') id: string, @Body() data: any) {
    const result = await this.bannersService.publishSidebarBanner(id, data);
    return {
      statusCode: HttpStatus.OK,
      message: "Banner publish successfully!",
      data: result
    }
  }

}
