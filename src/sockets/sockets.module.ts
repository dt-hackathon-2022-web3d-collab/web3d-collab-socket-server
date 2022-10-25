import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { UserService } from '../crud/users.service';
import { BroadcastService } from './brodcast.service';
import { SessionUsersService } from './session-users.service';
import { SessionsGateway } from './sessions.gateway';

@Global()
@Module({
  imports: [HttpModule],
  controllers: [],
  providers: [UserService, SessionUsersService, SessionsGateway, BroadcastService],
  exports: [],
})
export class SocketsModule {}
