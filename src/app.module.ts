import { MailerModule } from '@nestjs-modules/mailer';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { getEnvPath } from 'src/common/helpers/env.helper';
import configuration from 'src/config/configuration';
import { MorganMiddleware } from 'src/middlewares/morgan.middleware';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { HealthModule } from './modules/health/health.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { FormsModule } from './modules/forms/forms.module';
import { FormFieldsModule } from './modules/form-fields/form-fields.module';
import { FormResponsesModule } from './modules/form-responses/form-responses.module';

const envFilePath: string = getEnvPath(`${__dirname}/common/env`);
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath,
      load: [configuration],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    PrismaModule,
    HealthModule,
    CompaniesModule,
    FormsModule,
    FormFieldsModule,
    FormResponsesModule,
    
  ],
  controllers: [AppController],
  providers: [AppService, PrismaModule, MailerModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MorganMiddleware).forRoutes('*');
  }
}
