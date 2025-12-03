import { Injectable, NestInterceptor } from '@nestjs/common';
import { map } from 'rxjs';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context, next) {
    return next.handle().pipe(
      map((data) => {
        const res = context.switchToHttp().getResponse();
        if (res.headersSent) return data;
        return {
          statusCode: res.statusCode,
          data,
        };
      }),
    );
  }
}
