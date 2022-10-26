import { CacheModule, Module } from '@nestjs/common';
import { SocketsModule } from './sockets/sockets.module';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import type { ClientOpts } from 'redis';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), CacheModule.register<ClientOpts>({
    isGlobal: true,
    store: redisStore,

    host: 'localhost',
    port: 6379,
  }),SocketsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
