import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { API_VERSION } from "src/utils/api-verstion";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { RegisterAdminDto } from "./dto/register-admin.dto";
import { AdminLoginDto } from "./dto/admin-login.dto";

@Controller({
  path: "auth",
  version: API_VERSION.V1,
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  async create(@Body() createAuthDto: CreateAuthDto) {
    const result = await this.authService.userRegisterWithPhone(createAuthDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: "User register successfully!",
      data: result,
    };
  }

  @Post("verify-otp")
  async verifyOtp(@Body() payload: VerifyOtpDto) {
    const result = await this.authService.verifyOtp(payload);
    return {
      statusCode: HttpStatus.OK,
      message: "User login successfully!",
      data: result,
    };
  }

  @Post("resend-otp")
  async resendOtp(@Body("phoneNumber") phoneNumber: string) {
    const result = await this.authService.resendOtp(phoneNumber);
    return {
      statusCode: HttpStatus.OK,
      message: "OTP resent successfully!",
      data: result,
    };
  }

  @Post("admin/register")
  async registerAdmin(@Body() payload: RegisterAdminDto) {
    const result = await this.authService.registerAdmin(payload);

    return {
      statusCode: HttpStatus.CREATED,
      message: "Admin created successfully!",
      data: result,
    };
  }

  @Post("admin/login")
  async adminLogin(@Body() payload: AdminLoginDto) {
    const result = await this.authService.adminLogin(payload);

    return {
      statusCode: HttpStatus.OK,
      message: "Admin login successful!",
      data: result,
    };
  }
}
