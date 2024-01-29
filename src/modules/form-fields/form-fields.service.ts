import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProxyPrismaModel } from 'src/types/prisma-proxy';
import { CreateFormFieldDto } from './dto/create-form-fields.dto';
import { CreateOptionDto } from './dto/create-options.dto';

@Injectable()
export class FormFieldsService {
  private readonly formFieldsModel = ProxyPrismaModel(
    this.prismaService.formFields,
  );
  private readonly optionsModel = ProxyPrismaModel(this.prismaService.options);

  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly prismaService: PrismaService,
  ) {}

  async create(data: CreateFormFieldDto) {
    const { formId, optionsData, ...rest } = data;
    const formField = await this.formFieldsModel.create({
      data: {
        ...rest,
        form: {
          connect: {
            id: formId,
          },
        },
      },
    });
    if (data.type === 'selector' && optionsData) {
      await this.createOptions(formField.id, optionsData);
    }
    return formField;
  }

  async createOptions(formFieldId: string, options: string[]) {
    return await this.prismaService.options.createMany({
      data: options.map((option) => ({
        value:option,
        formFieldId,
      })),
    });
  }

  async createManyFields(data: CreateFormFieldDto[]) {
    const fields = [];
    for (const field of data) {
      const newField = await this.create(field);
      fields.push(newField);
    }
    return fields;
  }
}
