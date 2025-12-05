import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { ZodSerializationException, ZodValidationException } from 'nestjs-zod';
import { Prisma } from 'src/generated/prisma/client';
import z, { prettifyError, ZodError } from 'zod';
import { BaseResponseSchema } from '../response';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = exception.message ?? 'Internal server error';
    let error = 'InternalServerError';

    let res;

    // zod exception
    if (
      exception instanceof ZodValidationException ||
      exception instanceof ZodSerializationException
    ) {
      status = exception.getStatus();
      res = exception.getResponse() as any;
      message = z.prettifyError(exception.getZodError() as ZodError);
      error = res.errors;
    }

    // prisma client exception
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2000': // data too long
          status = HttpStatus.BAD_REQUEST;
          message = `value too long for column`;
          error = 'ValueTooLong';
          break;
        case 'P2002': // duplicate key
          status = HttpStatus.CONFLICT;
          console.log(exception);
          const target = exception.meta?.target as string[];
          message = `unique constraint failed on fileds : ${target[0] ?? []}`;
          error = 'DuplicateKey';
          break;
        case 'P2003': // not found foreign key
          status = HttpStatus.BAD_REQUEST;
          message = `Not found foreign key: ${exception.meta?.field_name ?? 'unknown'}`;
          error = 'NotFound';
          break;
        case 'P2025': // record not found
          status = HttpStatus.NOT_FOUND;
          message = 'Record not found';
          error = 'RecordNotFound';
          break;
        default:
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = `${exception.message}`;
          error = `${exception.name}`;
          console.log(exception.meta);
          break;
      }
    }
    // http
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      res = exception.getResponse();
      message = res.message;
      error = res.error;
    }

    response.status(status).json(
      BaseResponseSchema.parse({
        statusCode: status,
        success: false,
        data: error,
        message,
      }),
    );
  }
}
