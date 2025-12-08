import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BaseResponse } from 'src/common/dto/base-response';
import { ExampleDto } from './dto/example.dto';
import { RegisterDto } from './dto/request/register.dto';
import { LoginDto } from './dto/request/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<BaseResponse> {
    const result = await this.authService.register(dto);
    return BaseResponse.success(result, '회원가입에 성공했습니다.');
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<BaseResponse> {
    const result = await this.authService.login(dto);
    return BaseResponse.success(result, '로그인에 성공했습니다.');
  }
}
