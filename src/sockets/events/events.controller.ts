import { Body, Controller, Logger, Param, Post } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UpdateEvent } from './update-event';

@Controller(['sessions/:sessionId/:type'])
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(private eventEmitter: EventEmitter2) {}

  @Post()
  async sessionDataUpdated(
    @Param('sessionId') sessionId: string,
    @Param('type') type: string,
    @Body() body: any,
  ): Promise<any> {
    this.logger.debug(`Emitting ${type} ${sessionId}`);
    await this.eventEmitter.emit('update', new UpdateEvent(type, sessionId));
  }
}
