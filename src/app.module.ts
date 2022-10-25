import { CacheModule, Module } from '@nestjs/common';
import { SocketsModule } from './sockets/sockets.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CacheModule.register({isGlobal: true}),SocketsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
