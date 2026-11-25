import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateAuthDto } from "./dto/create-auth.dto";
import { UpdateAuthDto } from "./dto/update-auth.dto";
import { PrismaService } from "src/prisma/prisma";
import { UserAuthService } from "./auth.user.service";
import { OtpType } from "generated/prisma/enums";
import { SmsService } from "./sms.service";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import { JwtService } from "@nestjs/jwt";
import { RegisterAdminDto } from "./dto/register-admin.dto";
import { AdminLoginDto } from "./dto/admin-login.dto";
import { RoleType } from "generated/prisma/enums";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 64).toString("hex");
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedPassword: string): boolean {
    if (!storedPassword) {
      return false;
    }

    const parts = storedPassword.split(":");
    if (parts.length !== 2) {
      // Legacy fallback for existing plaintext admin passwords.
      return storedPassword === password;
    }

    const [salt, storedHash] = parts;
    const computedHash = scryptSync(password, salt, 64).toString("hex");
    return timingSafeEqual(
      Buffer.from(storedHash, "hex"),
      Buffer.from(computedHash, "hex"),
    );
  }

  constructor(
    private readonly prismaService: PrismaService,
    private readonly userAuthService: UserAuthService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
  ) {}

  async registerAdmin(payload: RegisterAdminDto, setupKey?: string) {
    const { name, email, password } = payload;
    const hashedPassword = this.hashPassword(password);

    const requiredSetupKey = process.env.ADMIN_SETUP_KEY;
    if (requiredSetupKey && setupKey !== requiredSetupKey) {
      throw new UnauthorizedException("Invalid admin setup key");
    }

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException("User already exists with this email");
    }

    return this.prismaService.$transaction(
      async (tx) => {
        const adminRole = await tx.role.upsert({
          where: { name: RoleType.ADMIN },
          update: {},
          create: { name: RoleType.ADMIN },
        });

        const user = await tx.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
            isActive: true,
            isEmailVerified: true,
            isVerified: true,
            phoneNumber: `admin:${email.toLowerCase()}`,
          },
        });

        await tx.userRole.create({
          data: {
            userId: user.id,
            roleId: adminRole.id,
          },
        });
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
          },
          message: "Admin registered successfully",
        };
      },
      {
        timeout: 20000,
        maxWait: 10000,
      },
    );
  }

  async adminLogin(payload: AdminLoginDto) {
    const { email, password } = payload;

    const user = await this.prismaService.user.findUnique({
      where: { email },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (
      !user ||
      !user.password ||
      !this.verifyPassword(password, user.password)
    ) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const roles = user.userRoles.map((userRole) => userRole.role.name);
    const isAdmin = roles.includes(RoleType.ADMIN);

    if (!isAdmin) {
      throw new UnauthorizedException("Admin access denied");
    }

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
        totalLogins: { increment: 1 },
      },
    });

    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        roles,
      },
      {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: "7d",
      },
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      accessToken,
    };
  }

  async userRegisterWithPhone(createAuthDto: CreateAuthDto) {
    const { phoneNumber } = createAuthDto;

    return this.prismaService.$transaction(
      async (tx) => {
        const existingUser = await tx.user.findUnique({
          where: { phoneNumber },
        });

        const user =
          existingUser ??
          (await this.userAuthService.createUserWithDefaultRole(
            tx,
            phoneNumber,
          ));

        const otp = await this.userAuthService.createOtp(
          tx,
          user.id,
          phoneNumber,
          OtpType.PHONE_LOGIN,
        );
        this.logger.debug("OTP generated for phone login", {
          userId: user.id,
          phoneNumber,
        });
        await this.smsService.sendOtpMessage(user.phoneNumber, otp);
        return {
          userId: user.id,
          phoneNumber,
          otpSent: true,
        };
      },
      {
        timeout: 20000, // 20 seconds
        maxWait: 10000, // wait 10s to acquire connection
      },
    );
  }

  async verifyOtp(payload: VerifyOtpDto) {
    const { phoneNumber, code } = payload;

    const otp = await this.prismaService.otp.findFirst({
      where: {
        target: phoneNumber,
        code,
        type: OtpType.PHONE_LOGIN,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (!otp) {
      throw new UnauthorizedException("OTP does not match");
    }
    if (otp.isUsed) {
      throw new UnauthorizedException("OTP already used");
    }

    if (otp.expiresAt < new Date()) {
      throw new UnauthorizedException("OTP expired");
    }
    await this.prismaService.otp.update({
      where: { id: otp.id },
      data: { isUsed: true },
    });

    const user = await this.prismaService.user.update({
      where: { id: otp.userId },
      data: {
        isPhoneVerified: true,
        isVerified: true,
        totalLogins: { increment: 1 },
        lastLogin: new Date(),
      },
      include: { userRoles: { include: { role: true } } },
    });

    const roles = user.userRoles.map((ur) => ur.role.name);
    const payloadJwt = { sub: user.id, phoneNumber: user.phoneNumber, roles };

    const accessToken = this.jwtService.sign(payloadJwt, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: "7d",
    });

    return {
      message: "OTP verified successfully",
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        isVerified: user.isVerified,
      },
      token: {
        accessToken,
      },
    };
  }

  async resendOtp(phoneNumber: string) {
    const user = await this.prismaService.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return this.prismaService.$transaction(async (tx) => {
      await tx.otp.updateMany({
        where: {
          userId: user.id,
          type: OtpType.PHONE_LOGIN,
          isUsed: false,
        },
        data: { isUsed: true },
      });

      const otp = await this.userAuthService.createOtp(
        tx,
        user.id,
        phoneNumber,
        OtpType.PHONE_LOGIN,
      );

      await this.smsService.sendOtpMessage(user.phoneNumber, otp);

      return {
        message: "OTP resent successfully",
        userId: user.id,
        phoneNumber: user.phoneNumber,
        otpSent: true,
      };
    });
  }
}
