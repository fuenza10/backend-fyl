import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { ProxyPrismaModel } from 'src/types/prisma-proxy';
import getWhere from './filters'
import { users } from '@prisma/client';

@Injectable()
export class CompaniesService {
  private readonly companiesModel = ProxyPrismaModel(
    this.prismaService.companies,
  );

  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly prismaService: PrismaService,
  ) { }
  async create(createCompanyDto: CreateCompanyDto) {
    const { userId, ...rest } = createCompanyDto;
    // Primero, crea la compañía
    const company = await this.companiesModel.create({
      data: {
        ...rest,
      },
    });

    await this.prismaService.userCompany.create({
      data: {
        userId: userId,
        companyId: company.id,
      },
    });

    return company;
  }

  async findAllPaginated(
    page: number,
    perPage: number,
    value: string | undefined,
    userId: string,
    user: users
  ) {
  
    return await this.companiesModel.findManyPaginated(
      {
        where: {

          state: true,
          name: {
            contains: value,
          },
          users: {
            some: {
              userId: user.id || userId,
            },
          },
        },
        include: {
          users: true,
        },
      },
      {
        page,
        limit: perPage,
      },
    );
  }

  async findAll(userId: string) {
    const companies = await this.companiesModel.findMany({
      where: {
        state: true,
        users: {
          some: {
            userId,
          },
        },
      },
    });
    return companies;
  }

  async findOne(id: string) {
    const company = await this.companiesModel.findUnique({
      where: { id },
    });
    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    const company = await this.companiesModel.update({
      where: { id },
      data: updateCompanyDto,
    });
    return company;
  }

  async remove(id: string) {
    const company = await this.companiesModel.update({
      where: { id },
      data: { state: false },
    });
    return company;
  }
}
