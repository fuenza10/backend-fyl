import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { AbstractHttpAdapter } from '@nestjs/core';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { formatUserAgent } from 'src/utilities/formatUserAgent';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: AbstractHttpAdapter) {}
  private logger = new Logger('HTTP');

  async catch(exception: HttpException, host: ArgumentsHost) {
    let errorMessage: unknown;
    let httpStatus: number;
    const httpAdapter = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const status = exception.getStatus();
    const errorType = exception.getResponse();
    const request = ctx.getRequest();

    let errorTitle =
      // biome-ignore lint/complexity/useLiteralKeys: <explanation>
      typeof errorType === 'object' ? errorType['error'] : errorType;
    const errorMsg =
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      typeof errorType === 'object' ? (errorType as any).message[0] : errorType;

    const { url, method, originalUrl } = request;
    const userAgent = formatUserAgent(request.headers['user-agent'] || '');
    // requestIp.mw();
    if (exception instanceof PrismaClientRustPanicError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (url.includes('login') && status === 422) {
      errorMessage = 'Email or Password is incorrect';
      errorTitle = 'Invalid Credentials';
    } else if (exception instanceof PrismaClientValidationError) {
      httpStatus = 422;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (exception instanceof PrismaClientInitializationError) {
      httpStatus = 400;
      errorMessage = exception.message;
    } else if (status && status >= 400 && status <= 499) {
      httpStatus = status;
      errorMessage = exception.message;
    } else {
      httpStatus = 500;
      errorMessage =
        'Sorry! something went to wrong on our end, Please try again later';
    }

    this.logger.error(`${method} ${originalUrl} ${httpStatus} - ${userAgent} `);
    const errorResponse = {
      status,
      error: errorTitle,
      msg: typeof errorMessage === 'string' ? errorMessage : errorMessage,
      details: errorMsg,
    };
    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);
  }
}
