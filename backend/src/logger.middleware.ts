// logger.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();

    // Captura del tamaño en bytes
    const originalWrite = res.write;
    const originalEnd = res.end;
    let bytesWritten = 0;

    res.write = function (chunk: any) {
      bytesWritten += chunk.length;
      return originalWrite.apply(res, arguments as any);
    };

    res.end = function (chunk: any) {
      if (chunk) bytesWritten += chunk.length;
      const duration = Number(process.hrtime.bigint() - start) / 1e6; // ms
      console.log(
        `[${req.method}] ${req.originalUrl} ${res.statusCode} - ${bytesWritten} bytes - ${duration.toFixed(2)}ms`,
      );
      return originalEnd.apply(res, arguments as any);
    };

    next();
  }
}
