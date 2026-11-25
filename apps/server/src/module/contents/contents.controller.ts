import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ContentsService } from "./contents.service";
import { CreateContentDto } from "./dto/create-content.dto";
import { UpdateContentDto } from "./dto/update-content.dto";
import { API_VERSION } from "src/utils/api-verstion";
import { ContentQueryDto } from "./dto/content-query.dto";

@Controller({
  path: "contents",
  version: API_VERSION.V1,
})
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post()
  async create(@Body() createContentDto: CreateContentDto) {
    const result = await this.contentsService.create(createContentDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: "Content created successfully!",
      data: result,
    };
  }

  @Get()
  async findAll(@Query() query: ContentQueryDto) {
    const result = await this.contentsService.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message: "Content retrieved successfully!",
      data: result,
    };
  }

  @Get("query")
  async findAllQuery() {
    const result = await this.contentsService.getAllQueryContent();
    return {
      statusCode: HttpStatus.OK,
      message: "Content retrieved successfully!",
      data: result,
    };
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    const result = await this.contentsService.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Content retrieved successfully!",
      data: result,
    };
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    const result = await this.contentsService.update(id, updateContentDto);
    return {
      statusCode: HttpStatus.OK,
      message: "Content updated successfully!",
      data: result,
    };
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    const result = await this.contentsService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: "Content deleted successfully!",
      data: result,
    };
  }
}
