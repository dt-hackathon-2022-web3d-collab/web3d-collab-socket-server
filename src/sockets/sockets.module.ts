import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { UserService } from '../crud/users.service';
import { BroadcastService } from './brodcast.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SessionUsersService } from './session-users.service';
import { SessionsGateway } from './sessions.gateway';
import { EventsController } from './events.controller';

@Global()
@Module({
  imports: [HttpModule, EventEmitterModule.forRoot()],
  controllers: [EventsController],
  providers: [UserService, SessionUsersService, SessionsGateway, BroadcastService],
  exports: [],
})
export class SocketsModule {}
