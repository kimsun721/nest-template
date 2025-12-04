import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from 'src/generated/prisma/client';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  async get(): Promise<User[]> {
    const users = this.prismaService.user.findMany();
    return users;
  }
}
