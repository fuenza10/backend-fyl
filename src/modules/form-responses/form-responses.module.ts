import { Module, forwardRef } from '@nestjs/common';
import { FormResponsesService } from './form-responses.service';
import { FormResponsesController } from './form-responses.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [FormResponsesController],
  providers: [FormResponsesService],
  imports: [
    forwardRef(() => PrismaModule),
  ]
})
export class FormResponsesModule {}
