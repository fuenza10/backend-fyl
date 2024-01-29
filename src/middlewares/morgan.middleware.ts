import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { formattedUserAgent } from 'src/utilities/formatUserAgent';

@Injectable()
export class MorganMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  async use(
    request: FastifyRequest,
    reply: FastifyReply['raw'],
    next: () => void,
  ) {
    const { method, originalUrl } = request;
    const userAgent = formattedUserAgent(request.headers['user-agent'] || '');

    const start = Date.now();
    reply.on('finish', () => {
      const { statusCode } = reply;
      const contentLength = reply.getHeader('content-length');
      const duration = Date.now() - start;
      if (statusCode >= 400) return;
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} B - ${userAgent}   - ${duration}ms `,
      );
    });
    next();
  }
}
