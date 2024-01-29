import {
	Body,
	Controller,
	Get,
	HttpStatus,
	Param,
	Patch,
	Post,
	Put,
	UseGuards,
} from '@nestjs/common';
import { CurrentUser, Roles } from 'src/modules/auth/decorator';

import { RolesGuard, JwtAuthGuard } from 'src/modules/auth/guards';
import { UpdateProfileDto } from './dto/update-profile.dto';

import { RoleEnum, users as User } from '@prisma/client';
import { UpdatePasswordDto } from './dto';
import { UsersService } from './users.service';
import { RegisterUserBody, RegisterUserResponse } from '../auth/dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@Roles(RoleEnum.ADMIN_ROLE)
	async findAll() {
		const users = await this.usersService.findAll();

		const modifiedUsers = users.map((user) => {
			// Eliminar la contraseña
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			const modifiedUser = { ...user } as any;
			modifiedUser.password = undefined;

			// Extraer roles si UserRole existe
			const roles = modifiedUser.UserRole
				? modifiedUser.UserRole.map((userRole) => userRole.Role.name)
				: [];

			// Combinar con el resto de los datos del usuario
			return {
				...modifiedUser,
				UserRole: roles,
			};
		});
		return {
			ok: true,
			status: HttpStatus.OK,
			usuarios: modifiedUsers,
		};
	}

	@Get('/find/:email')
	async findOne(@Param('email') email: string) {
		const user = await this.usersService.findOne({ email });
		user.password = undefined;
		return user;
	}

	@Put('profile')
	async update(
		@CurrentUser() user: User,
		@Body() updateUserDto: UpdateProfileDto,
	) {

		const res = await this.usersService.update(user.id, updateUserDto);
		return res;
	}

	@Get('/me')
	getProfile(@CurrentUser() user: User) {
		user.password = undefined;
		return user;
	}
	@Patch('profile')
	async changePassword(
		@CurrentUser() user: User,
		@Body() updatePasswordDto: UpdatePasswordDto,
	) {
		
		const res = await this.usersService.updatePassword(
			user.id,
			updatePasswordDto,
		);
		return res;
	}

	@Roles(RoleEnum.ADMIN_ROLE)
	@Patch('/:id')
	async removeUser(@Param('id') id: string) {
		const res = await this.usersService.remove(id);
		return res;
	}

	@Roles(RoleEnum.ADMIN_ROLE, RoleEnum.CLIENT_ROLE)
	@Post('/new-user')
	async create(@Body() user: RegisterUserBody,@CurrentUser() creatorUser: User):Promise<RegisterUserResponse> {
		const res = await this.usersService.createUserWithCompany(user, creatorUser);
		const payload = new RegisterUserResponse();
		payload.ok = true;
		payload.status = HttpStatus.CREATED;
		payload.user = res;

		return payload;
	}
}
