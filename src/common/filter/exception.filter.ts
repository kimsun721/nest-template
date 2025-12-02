import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status;
    let res;
    let message;
    let error;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      res = exception.getResponse();
      message = res.message;
      error = res.error;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message ?? 'Internal server error';
      error = 'InternalServerError';
    }

    response.status(status).json({
      status,
      message,
      error,
    });
  }
}
