import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { $Enums, users as User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePasswordDto, UpdateProfileDto } from './dto';
import { RegisterUserBody } from '../auth/dto';

interface FindAllArgs {
  relations?: string[];
}
interface FindOneArgs extends FindAllArgs {
  id?: string;
  email?: string;
}
@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) { }
  private logger: Logger = new Logger('UsersService');
  async create({
    firstName,
    lastName,
    email,
    userRole,
    password,
    rut,
  }: RegisterUserBody): Promise<User> {
    try {
      const roleEntities = await Promise.all(
        userRole.map((role) =>
          this.prismaService.role.upsert({
            where: { name: role },
            update: {},
            create: { name: role },
          }),
        ),
      );
      const newUser = await this.prismaService.users.create({
        data: {
          rut,
          email,
          firstName,
          lastName,
          password: bcrypt.hashSync(password, 10),
          UserRole: {
            create: roleEntities.map((role) => ({
              Role: {
                connect: {
                  id: role.id,
                },
              },
            })),
          },
        },
        include: {
          UserRole: {
            select: {
              Role: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      });

      const response = {
        ...newUser,
        UserRole: newUser.UserRole.map((userRole) => userRole.Role.name),
      };

      return response;
    } catch (error) {
      this.handleDBError(error);
    }
  }

  async findAll(): Promise<User[]> {
    const users = await this.prismaService.users.findMany({
      include: {
        UserRole: {
          select: {
            Role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return users;
  }

  async findOne({ id, email }: FindOneArgs): Promise<User> {
    if (id) {
      const userWithRole = await this.prismaService.users.findUnique({
        where: {
          id: id,
        },
        include: {
          UserRole: {
            select: {
              Role: {
                select: {
                  name: true,
                },
              },
            },
          },
          companies: {
            select: {
              companyId: true
            }
          }
        },
      });

      // Extraer los roles a un array de strings
      const roles = userWithRole.UserRole.map((userRole) => userRole.Role.name);

      // Combinar con el resto de los datos del usuario
      const response = {
        ...userWithRole,
        UserRole: roles,
      };

      return response;
    }
    if (email) {
      const userWithRole = await this.prismaService.users.findFirst({
        where: {
          email: email,
        },
        include: {
          UserRole: {
            select: {
              Role: {
                select: {
                  name: true,
                },
              },
            },
          },
          companies: {
            select: {
              companyId: true
            }
          }
        },
      });

      if (userWithRole) {
        // Extraer los roles a un array de strings
        const roles = userWithRole?.UserRole.map(
          (userRole) => userRole.Role.name,
        );
        const companyIds = userWithRole?.companies.map(
          (company) => company.companyId
        )

        // Combinar con el resto de los datos del usuario
        const response = {
          ...userWithRole,
          UserRole: roles,
          companies: companyIds
        };
        return response;
      }
      return userWithRole;
    }
    throw new Error('One of ID, email or post ID must be provided.');
  }
  async findByEmail(email: string): Promise<User> {
    return await this.prismaService.users.findFirst({
      where: {
        email: email,
      },
    });
  }

  async update(id: string, updateUserInput: UpdateProfileDto): Promise<User> {
    const user = await this.prismaService.users.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.prismaService.users.update({
      where: {
        id: id,
      },
      data: {
        ...user,
        ...updateUserInput,
      },
    });
  }
  async updatePassword(
    id: string,
    passwords: UpdatePasswordDto,
  ): Promise<User> {
    const user = await this.prismaService.users.findUnique({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    // if (!bcrypt.compare(passwords.oldPassword, user.password)) {
    //   throw new BadRequestException('Password update failed');
    // }
    const updatedUser = await this.prismaService.users.update({
      where: { id: user.id },
      data: {
        password: bcrypt.hashSync(passwords.newPassword, 10),
      },
    });
    return updatedUser;
  }

  async remove(id: string): Promise<User> {
    const user = await this.prismaService.users.update({
      where: {
        id: id,
      },
      data: {
        state: false,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  private handleDBError(error) {
    if (error.code === 11000) {
      throw new BadRequestException(error.message.split(':')[2]);
    }
    this.logger.error(error.message);
    throw new InternalServerErrorException('Please check server logs');
  }
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
async  createUserWithCompany(data: RegisterUserBody, creatorUser: any) {

    const { companyId } = data;

    //el role por defecto es USER_ROLE


    // Busca si existe la compañia
    const company = await this.prismaService.companies.findUnique({
      where: {
        id: companyId,
      },
    });
  

    if (!company && creatorUser.UserRole[0] !== $Enums.RoleEnum.ADMIN_ROLE) {
      throw new NotFoundException('Company not found');
    }
    //se crea el usuario
    // const newUser = await this.create(data)
    const roleEntities = await Promise.all(
      data.userRole.map((role) =>
        this.prismaService.role.upsert({
          where: { name: role },
          update: {},
          create: { name: role },
        }),
      ),
    );
    const newUser = await this.prismaService.users.create({
      data: {
        rut: data.rut,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: bcrypt.hashSync(data.password, 10),
        UserRole: {
          create: roleEntities.map((role) => ({
            Role: {
              connect: {
                id: role.id,
              },
            },
          })),
        },
        ...(creatorUser.UserRole[0] !== $Enums.RoleEnum.ADMIN_ROLE && {
          companies: {
            create: {
              companyId: companyId,
            },
          },
        }),
      },
    });



    return newUser;




  }
}

