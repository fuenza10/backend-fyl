import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProxyPrismaModel } from 'src/types/prisma-proxy';
import { CreateFormResponseDto } from './dto/create-form-response.dto';
import { users } from '@prisma/client';
import { UpdateFormResponseDto } from './dto/update-form-response.dto';

@Injectable()
export class FormResponsesService {
  private readonly formResponseModel = ProxyPrismaModel(
    this.prismaService.formResponses,
  );

  constructor(
    @Inject(forwardRef(() => PrismaService))
    private readonly prismaService: PrismaService,
  ) { }

  async create(data: CreateFormResponseDto, user: users) {
    const { formId, companyId, responses } = data;


    const createdResponse = await this.prismaService.responses.create({
      data: {
        formId: formId,
        companyId: companyId,
      },
    });

    // Luego, crea el registro 'formResponses' y conecta el 'responses' creado
    for (const response of responses) {
      await this.prismaService.formResponses.create({
        data: {
          value: response.value.toString(), // Convertir el valor a string
          formField: {
            connect: {
              id: response.questionId,
            },
          },
          user: {
            connect: {
              id: user.id,
            },
          },
          companies: {
            connect: {
              id: companyId,
            },
          },
          responses: {
            connect: {
              id: createdResponse.id, // Conecta el 'responses' creado
            },
          },
        },
      });
    }
    return await this.prismaService.formResponses.findMany({
      where: {
        responses: {

          formId: formId,
          companyId: companyId,

        }
      }
    })
  }


  async update({ formId, companyId, data, user }: { formId: string, companyId: string, data: UpdateFormResponseDto, user: users }) {
    const { formResponse,id } = data;

   
    const updatedResponse = await this.prismaService.responses.update({
      where: {
        id: id, 
      },
      data: {
        company: {
          connect:{
            id: companyId, 
          }
        },
        forms: {
          connect:{
            id: formId, 
          }
        }
      },
    });

    // Luego, actualiza cada registro 'formResponses'
    for (const response of formResponse) {
      const existingRecord = await this.prismaService.formResponses.findUnique({
        where: {
          id: response.formResponseId,
        },
      });
    
      if (!existingRecord) {
        console.log(`Registro con ID ${response.questionId} no encontrado`);
        continue;
      }
      await this.prismaService.formResponses.update({
        where: {
          id: response.formResponseId, // Asegúrate de que este es el ID correcto
        },
        data: {
          value: response.value.toString(), // Convertir el valor a string

          user: {
            connect: {
              id: user.id,
            },
          },
          companies: {
            connect: {
              id: companyId,
            },
          },
          responses: {
            connect: {
              id: updatedResponse.id, 
            },
          },
        },
      });
    }

    return await this.prismaService.formResponses.findMany({
      where: {
        responses: {
          formId: formId,
          companyId: companyId,
        },
      },
    });
  }
}
