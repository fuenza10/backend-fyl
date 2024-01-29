 import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, Res, Query, UseGuards } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyResponse } from './responses/response.company';
import { FastifyReply } from 'fastify';
import { RoleEnum, users } from '@prisma/client';
import { CurrentUser, Roles } from '../auth/decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyResponse> {

    const company = await this.companiesService.create(createCompanyDto);
    const payload = new CompanyResponse();
    payload.ok = true;
    payload.status = HttpStatus.CREATED;
    payload.company = company;
    return payload;
  }

  @Get()
  
  findAll(@CurrentUser() user: users) {
    return this.companiesService.findAll(user.id);
  }
  @Get('/paginated/active')
  @Roles(RoleEnum.ADMIN_ROLE, RoleEnum.CLIENT_ROLE)
  async findAllActive(
    @Res() reply: FastifyReply,
    @Query('page') page: number,
    @Query('per_page') perPage: number,
    @Query('search') search: string,
    @Query('userId') userId: string,
    @CurrentUser() user: users,
  ) {
    return await this.companiesService
      .findAllPaginated(page, perPage, search, userId, user)
      .then((res) => {
        reply.code(HttpStatus.OK).send(res);
      })
      .catch((error) => {
        reply.code(500).send({
          ok: false,
          status: error.response.statusCode,
          msg: 'Error al obtener las empresas',
          error: error.message,
        });
      });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    
    const company = await this.companiesService.update(id, updateCompanyDto);
    const payload = new CompanyResponse();
    payload.ok = true;
    payload.status = HttpStatus.CREATED;
    payload.company = company;
    return payload;

  }

  @Delete(':id')
  async remove(@Param('id') id: string) {

    const company = await this.companiesService.remove(id);
    const payload = new CompanyResponse();
    payload.ok = true;
    payload.status = HttpStatus.CREATED;
    payload.company = company;
    return payload;
  }
}
