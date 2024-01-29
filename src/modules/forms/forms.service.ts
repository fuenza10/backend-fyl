import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { Prisma, forms, responses, $Enums } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProxyPrismaModel } from 'src/types/prisma-proxy';
import { CreateFormDto } from './dto/create-form.dto';
import getWhere from './filters';

interface PaginatedForms {
  data: forms[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}
@Injectable()
export class FormsService {
  private readonly formModel = ProxyPrismaModel(this.prismaService.forms);

  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly prismaService: PrismaService,
  ) { }
  async createForm(data: CreateFormDto): Promise<forms> {
    return this.formModel.create({
      data: {
        name: data.name,

        userForms: {
          create: {
            userId: data.userId,
          },
        },
      },
    });
  }

  async findAllForms(): Promise<forms[]> {
    return this.formModel.findMany();
  }

  async findManyPaginated(
    page: number,
    perPage: number,
    value: string | undefined,
    companuId: string | undefined,
    userId: string | undefined,
  ): Promise<PaginatedForms> {
    const user = await this.prismaService.users.findUnique({
      where: { id: userId }, include: {
        UserRole: {
          select: {
            Role: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    })
    const role = user.UserRole.map((role) => role.Role.name)
    return await this.formModel.findManyPaginated(
      {
        where: $Enums.RoleEnum.ADMIN_ROLE === role[0] ? {
          name: {
            contains: value,
          },
        } : {

          ...getWhere(companuId, userId),
          name: {
            contains: value,
          },
        },
        include: {
          CompanyForms: {
            include: {
              companies: {
                select: {
                  name: true,
                },
              },
            },
          },
          fields: {
            select: {
              id: true,
              label: true,
              type: true,
              options: true,
            },
          },
        },
      },
      {
        limit: perPage,
        page,
      },
    );
  }



  async findFormById(id: string): Promise<forms | null> {
    return this.formModel.findUnique({
      where: { id },
      include: {
        fields: true,
      },
    });
  }

  async updateForm(id: string, data: Prisma.formsUpdateInput): Promise<forms> {
    return this.formModel.update({
      where: { id },
      data,
    });
  }

  async deleteForm(id: string): Promise<forms> {
    await this.prismaService.formFields.deleteMany({
      where: {
        formId: id,
      },
    });

    // Luego, elimina el formulario
    return this.formModel.delete({
      where: { id },
    });
  }

  async responseFormCompany(
    companyIds: string[],
  ): Promise<responses[] | null> {
    return await this.prismaService.responses.findMany({
      where: {
        companyId: {
          in: companyIds,
        },
      },
      include: {
        forms: {
          select: {
            name: true,
            fields: {
              select: {
                label: true,
                type: true,
                id: true,
                options: true,
              }
            }
          }
        },
        company: {
          select: {
            name: true,
          }

        },
        formResponses: {
          select: {
            id: true,
            value: true,
            createdAt: true,
            formField: {
              select: {
                id: true,
                label: true,
                type: true,
              },

            }
          }
        },

      }
    });
  }
}
