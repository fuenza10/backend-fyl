import {
  Body,
  Controller,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { users } from '@prisma/client';
import { CurrentUser } from '../auth/decorator';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CreateFormResponseDto } from './dto/create-form-response.dto';
import { UpdateFormResponseDto } from './dto/update-form-response.dto';
import { FormResponsesService } from './form-responses.service';

@Controller('form-responses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FormResponsesController {
  constructor(private readonly formResponsesService: FormResponsesService) {}
  @Post('/')
  async create(
    @CurrentUser() user: users,
    @Body() data: CreateFormResponseDto,
  ) {
    return await this.formResponsesService.create(data, user);
  }

  @Patch('/')
  async update(
    @Query('formId') formId: string,
    @Query('companyId') companyId: string,
    @Body() data: UpdateFormResponseDto,
    @CurrentUser() user: users,
  ) {

    return await this.formResponsesService.update({
      formId,
      companyId,
      data,
      user,
    });
  }
}
