import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserQueryDto } from "./dto/user-query-dto";
import { API_VERSION } from "src/utils/api-verstion";
import { CurrentUser } from "src/authentication/current-user.decorator";
import { JwtAuthGuard } from "src/authentication/jwt-auth.guard";

@Controller({
  path: "users",
  version: API_VERSION.V1,
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll(@Query() query: UserQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get("my-profile")
  @UseGuards(JwtAuthGuard)
  getUserMyProfile(@CurrentUser() user: any) {
    return this.usersService.getUserMyProfile(user.userId);
  }

  @Get("profile/:id")
  getUserProfile(@Param("id") id: string) {
    return this.usersService.getUserProfile(id);
  }

  @Patch("profile/:id")
  updateUserProfile(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUserProfile(id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }
}
