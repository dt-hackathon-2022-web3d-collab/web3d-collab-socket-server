import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { UserService } from '../crud/users.service';
import { EventsController } from './events/events.controller';
import { HealthController } from './events/health.controller';
import { SessionUsersService } from './session-users.service';
import { SessionsGateway } from './sessions.gateway';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionsCleanup } from './sessions-cleanup.service';

@Global()
@Module({
  imports: [HttpModule, EventEmitterModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [EventsController, HealthController],
  providers: [
    UserService,
    SessionUsersService,
    SessionsGateway,
    SessionsCleanup,
  ],
  exports: [],
})
export class SocketsModule {}
