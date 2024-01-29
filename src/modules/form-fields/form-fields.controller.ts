import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { FormFieldsService } from './form-fields.service';
import { CreateFormFieldDto } from './dto/create-form-fields.dto';
import { FormFieldsResponse } from './responses/form-fields.response';

@Controller('form-fields')
export class FormFieldsController {
  constructor(private readonly formFieldsService: FormFieldsService) {}

  @Post('/')
  async createOneFormFields(@Body() data: CreateFormFieldDto) {
    return await this.formFieldsService.create(data);
  }

  @Post('/many')
  async createManyFormFields(@Body() data: CreateFormFieldDto[]):Promise<FormFieldsResponse> {

    const formFields =await this.formFieldsService.createManyFields(data);
    const payload = new FormFieldsResponse();
    payload.ok = true;
    payload.status = HttpStatus.CREATED;
    payload.formFields = formFields;
    return payload;
  }
}
