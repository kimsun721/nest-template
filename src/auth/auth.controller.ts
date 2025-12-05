import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { BaseResponse } from 'src/common/response';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  async get() {
    const users = await this.prismaService.user.findMany();
    return BaseResponse.success(users, 'user found');
  }
}
