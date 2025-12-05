import { HttpStatus } from '@nestjs/common';
import z from 'zod';

export const BaseResponseSchema = z.object({
  statusCode: z.number().default(HttpStatus.OK),
  success: z.boolean().default(true),
  data: z.json().default(null),
  message: z.string().default(''),
});

export class BaseResponse {
  static success<T>(data: T, message: string) {
    return {
      success: true,
      data,
      message,
    };
  }
  static fail<T>(data: T, message: string) {
    return {
      success: false,
      data,
      message,
    };
  }
}
