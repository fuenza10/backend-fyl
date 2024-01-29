import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseArrayPipe,
  Post,
  Query,
} from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { FormsResponse } from './response';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) { }

  @Post('/')
  async createForm(
    @Body() createFormDto: CreateFormDto,
  ): Promise<FormsResponse> {
    const form = await this.formsService.createForm(createFormDto);
    const payload = new FormsResponse();
    payload.ok = true;
    payload.status = HttpStatus.CREATED;
    payload.form = form;

    return payload;
  }

  @Get('/')
  async findAllForms() {
    return await this.formsService.findAllForms();
  }

  @Get('/get/paginated')
  async findManyPaginated(
    @Query('page') page: number,
    @Query('per_page') perPage: number,
    @Query('search') value: string | undefined,
    @Query('companyId') companuId: string | undefined,
    @Query('userId') userId: string | undefined,
  ): Promise<FormsResponse> {
    const forms = await this.formsService.findManyPaginated(
      page,
      perPage,
      value,
      companuId,
      userId,
    );
    const payload = new FormsResponse();
    payload.ok = true;
    payload.status = HttpStatus.OK;
    payload.forms = forms.data;
    payload.meta = forms.meta;
    return payload;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.formsService.findFormById(id);
  }

  @Get('/get/form-response')
  async getFormResponse(
    @Query('companyId', new ParseArrayPipe({ items: String, separator: ',' })) companyIds: string[],
  ): Promise<FormsResponse> {
    const forms = await this.formsService.responseFormCompany(companyIds);
    const payload = new FormsResponse();

    payload.ok = true;
    payload.status = HttpStatus.OK;
    // @ts-ignore
    payload.forms = forms

    return payload;

  }

  @Delete('/:id')
  async deleteForm(@Param('id') id: string) {

    return await this.formsService.deleteForm(id);
  }
}
