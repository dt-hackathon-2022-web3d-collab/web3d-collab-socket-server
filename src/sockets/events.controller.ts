import { Body, Controller, Logger, Param, Post } from "@nestjs/common";
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller([
    'sessions/:sessionId/:type',

])
export class EventsController {

    private readonly logger = new Logger(EventsController.name);

    constructor(private eventEmitter: EventEmitter2) { }

    @Post()
    async sessionDataUpdated(
        @Param('sessionId') sessionId: string,
        @Param('type') type: string,
        @Body() body: any,
    ): Promise<any> {
        console.log('emit')
        await this.eventEmitter.emit('users', body)
    }
}