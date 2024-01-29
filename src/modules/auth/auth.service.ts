import {
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/modules/users/users.service';

import { TokenExpiredError } from 'jsonwebtoken';

import {
  LoginUserBody,
  RegisterUserBody,
  ResetPasswordBody,
  UserServiceResponse,
} from './dto';

import { users as User, $Enums } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  logger = new Logger('AuthService');
  constructor(
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async validateUserWithPassword(email: string, pass: string): Promise<User> {
    const user = await this.usersService.findOne({ email });
    if (user) {
      if (!user.state) {
        throw new UnauthorizedException('User is inactive, talk with an admin');
      }
      const { password } = user;
      const match = await bcrypt.compare(pass, password);
      user.password = undefined;
      if (match) {
        return user;
      }
    }
    return null;
  }
  async validateUser(id: string): Promise<User> {
    const user = await this.usersService.findOne({ id });

    if (!user.state) {
      throw new UnauthorizedException('User is inactive, talk with an admin');
    }
    return user;
  }

  async generateAccessToken(user: User) {
    user.password = undefined;
    user.email = undefined;
    const payload = { sub: String(user.id), ...user };
    return await this.jwtService.signAsync(payload);
  }

  async createRefreshToken(user: User, ttl: number) {
    const expiration = new Date();
    expiration.setTime(expiration.getTime() + ttl);

    const refreshToken = await this.prismaService.refreshToken.create({
      data: {
        userId: user.id,
        expires: expiration,
      },
    });
    return refreshToken;
  }

  async generateRefreshToken(user: User, expiresIn: number) {
    const payload = { sub: String(user.id) };
    const token = await this.createRefreshToken(user, expiresIn);
    return await this.jwtService.signAsync(
      { ...payload, expiresIn, jwtId: String(token.id) },
      { expiresIn: '7d' },
    );
  }

  async resolveRefreshToken(encoded: string) {
    try {
      const payload = await this.jwtService.verify(encoded);
      this.logger.log(payload);
      if (!payload.sub || !payload.jwtId) {
        throw new UnprocessableEntityException('Refresh token malformed');
      }

      const token = await this.prismaService.refreshToken.findUnique({
        where: {
          id: payload.jwtId,
        },
      });
      this.logger.log(token);

      if (!token) {
        throw new UnprocessableEntityException('Refresh token not found');
      }

      if (token.revoked) {
        throw new UnprocessableEntityException('Refresh token revoked');
      }

      const user = await this.usersService.findOne({ id: payload.sub });
      if (!user) {
        throw new UnprocessableEntityException('Refresh token malformed');
      }

      return { user, token };
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnprocessableEntityException('Refresh token expired');
      }
      throw new UnprocessableEntityException('Refresh token malformed');
    }
  }
  async getUserFromToken(token: string): Promise<User> {
    const payload = await this.jwtService.verify(token);
    const user = await this.usersService.findOne({ id: payload.sub });
    if (!user) {
      throw new UnprocessableEntityException('Refresh token malformed');
    }

    return user;
  }

  async createAccessTokenFromRefreshToken(refresh: string) {
    const { user } = await this.resolveRefreshToken(refresh);

    const token = await this.generateAccessToken(user);

    return { user, token };
  }

  async register({
    email,
    rut,
    password,
    firstName,
    userRole,
    lastName,
  }: RegisterUserBody): Promise<User> {
    try {
      const user = await this.usersService.findOne({ email });
      if (user) {
        // error user already exists
        throw new UnprocessableEntityException('User already exists');
      }

      const registerUserBody: RegisterUserBody = {
        email,
        rut,
        password,
        userRole,
        lastName,
        firstName,
      };

      const userResponse = await this.usersService.create(registerUserBody);

    
      return userResponse;
    } catch (error) {
      this.logger.error(error);
      throw new Error(error);
    }
  }
  async login(loginInput: LoginUserBody): Promise<User> {
    const { email, password } = loginInput;
    const user = await this.usersService.findOne({ email });
    if (!user) {
      throw new UnprocessableEntityException('Invalid credentials');
    }
    if (!bcrypt.compare(password, user.password)) {
      throw new Error('Invalid credentials');
    }
    return user;
  }
  // async loginRefresh(user: any) {
  // 	const payload = { email: user.email, sub: user.userId };
  // 	return {
  // 		access_token: this.jwtService.sign(payload),
  // 	};
  // }
  async resetPassword(
    payload: ResetPasswordBody,
  ): Promise<UserServiceResponse> {
    const { token, password } = payload;
    const decoded = await this.jwtService.verify(token);
    const user = await this.validateUser(decoded.sub);

    if (!user) {
      throw new UnprocessableEntityException('Invalid token');
    }
    const salt = await bcrypt.genSalt();
    const newPassword = await bcrypt.hash(password, salt);
    const updatedUser = await this.prismaService.users.update({
      where: { id: user.id },
      data: { password: newPassword },
    });
    return {
      ok: true,
      status: HttpStatus.OK,
      user: updatedUser,
      accessToken: await this.generateAccessToken(updatedUser),
      refreshToken: await this.generateRefreshToken(updatedUser, 60 * 60 * 24),
    };
  }
  private async getRoleIdByName(name: $Enums.RoleEnum): Promise<string> {
    const role = await this.prismaService.role.findFirst({
      where: {
        name: name,
      },
    });
    if (role) {
      return role.id;
    }
    return null;
  }
}
