import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/request/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/request/login.dto';
import { RedisService } from './redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async register(dto: RegisterDto): Promise<void> {
    const { username, email, password } = dto;
    const hashedPassword = await this.hashPassword(password);
    await this.prisma.user.create({ data: { email, username, password: hashedPassword } });
    return;
  }

  async login(dto: LoginDto) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUniqueOrThrow({ where: { email } });

    const result = await this.comparePassword(password, user.password);
    if (!result) throw new BadRequestException('비밀번호가 일치하지 않습니다.');

    const payload = {
      userId: user.id,
      email: user.email,
      uesrname: user.username,
    };
    const accessToken = await this.jwtService.sign(payload, { expiresIn: '10m' });
    const uuid = crypto.randomUUID();
    const userId = user.id;

    const refreshToken = await this.redis.get(`refresh:${uuid}`);
    if (refreshToken) {
      await this.redis.expire(`refresh:${uuid}`, 604800);
    } else {
      await this.redis.setex(`refresh:${uuid}`, 604800, userId.toString());
    }

    return { accessToken, uuid };
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  }

  async comparePassword(password: string, encrypted: string): Promise<boolean> {
    return await bcrypt.compare(password, encrypted);
  }
}
