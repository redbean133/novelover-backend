import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Response } from 'express';

export type RpcExceptionResponse = {
  statusCode: number;
  message: string;
};

@Catch(RpcException)
export class RpcToHttpExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const error = exception.getError();

    if (error && typeof error === 'object') {
      const statusCode =
        (error as RpcExceptionResponse).statusCode ||
        HttpStatus.INTERNAL_SERVER_ERROR;
      const message =
        (error as RpcExceptionResponse).message || 'Internal server error';

      response.status(statusCode).json({
        statusCode,
        message,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: String(error),
      });
    }
  }
}
