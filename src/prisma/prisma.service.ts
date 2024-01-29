import { INestApplication, Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {

  async onModuleInit() {
    await this.$connect();
  }

  // async enableShutdownHooks(app: INestApplication): Promise<void> {
  //   this.$on("beforeExit" as never, async () => {
  //     await app.close();
  //   });
  // }
}
