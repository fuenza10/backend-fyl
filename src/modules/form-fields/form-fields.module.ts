import { Module, forwardRef } from '@nestjs/common';
import { FormFieldsService } from './form-fields.service';
import { FormFieldsController } from './form-fields.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [FormFieldsController],
  providers: [FormFieldsService],
  imports: [forwardRef(() => PrismaModule)],
})
export class FormFieldsModule {}
