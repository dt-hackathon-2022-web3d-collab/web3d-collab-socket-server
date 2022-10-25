import { CacheModule, Module } from '@nestjs/common';
import { SocketsModule } from './sockets/sockets.module';


@Module({
  imports: [CacheModule.register({isGlobal: true}),SocketsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
