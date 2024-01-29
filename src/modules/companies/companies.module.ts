import { Module, forwardRef } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [CompaniesController],
  providers: [CompaniesService],
  imports: [forwardRef(() => UsersModule), forwardRef(() => PrismaModule)],
})
export class CompaniesModule {}
