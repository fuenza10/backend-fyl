import {
  Body,
  Controller,
  HttpStatus,
  Logger,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { users } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginUserBody, LoginUserResponse, RegisterUserBody, RegisterUserResponse } from './dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
interface RequestWithUser extends FastifyRequest {
  user: users; // Cambia 'any' por el tipo de tu usuario
}
@Controller('auth')
export class AuthController {
  logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('loginRefresh')
  async loginRefresh(@Request() req:Partial<RequestWithUser>): Promise<LoginUserResponse> {
    const accessToken = await this.authService.generateAccessToken(req.user);
    const refreshToken = await this.authService.generateRefreshToken(
      req.user,
      12 * 60 * 60 * 1000,
    );

    req.user.password = undefined;

    const payload = new LoginUserResponse();
    payload.ok = true;
    payload.status = HttpStatus.OK;
    payload.user = req.user;
    payload.accessToken = accessToken;
    payload.refreshToken = refreshToken;

    return payload;
  }

  @Post('login')
  async login(
    @Body() loginInput: LoginUserBody,
    @Res() reply: FastifyReply,
  ): Promise<LoginUserResponse> {
    const user = await this.authService.login(loginInput);
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(
      user,
      12 * 60 * 60 * 1000,
    );

    return reply.code(HttpStatus.OK).send({
      ok: true,
      status: HttpStatus.OK,
      user,
      accessToken,
      refreshToken,
    });
  }

  @Post('register')
  async register(
    @Body() registerInput: RegisterUserBody,
    @Res() reply: FastifyReply,
  ): Promise<RegisterUserResponse> {
    const user = await this.authService.register(registerInput);
    const accessToken = await this.authService.generateAccessToken(user);
    const refreshToken = await this.authService.generateRefreshToken(
      user,
      12 * 60 * 60 * 1000,
    );
    const payload = new RegisterUserResponse();
    payload.ok = true;
    payload.status = HttpStatus.CREATED;
    payload.user = user;
    payload.token = accessToken;
    payload.refreshToken = refreshToken;

    return reply.send(payload);
  }
}
