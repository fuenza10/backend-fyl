import { Module, forwardRef } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [FormsController],
  providers: [FormsService],
  imports: [forwardRef(() => PrismaModule)],
})
export class FormsModule {}
