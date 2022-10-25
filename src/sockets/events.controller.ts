import { Body, Controller, Param, Post } from "@nestjs/common";
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller([
    'sessions/:sessionId/:type',

])
export class EventsController {


    constructor(private eventEmitter: EventEmitter2) {}
    
    @Post()
    async sessionDataUpdate(
        @Param('sessionId')
        sessionId: string,
        @Param('type')
        type: string,
        @Body() body: any,
    ): Promise<any> {

    }
}