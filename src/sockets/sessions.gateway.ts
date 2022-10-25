import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '../crud/entities/user.entity';
import { UserService } from '../crud/users.service';
import { BroadcastService } from './brodcast.service';
import { UserJoin } from './dto/message.dto';
import { SessionUsersService } from './session-users.service';
import { OnEvent } from '@nestjs/event-emitter';
import { UpdateEvent } from './events/update-event';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SessionsGateway implements OnGatewayDisconnect {
  private readonly logger = new Logger(SessionsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly broadcastService: BroadcastService,
    private readonly sessionUsersService: SessionUsersService,
  ) { }

  async handleDisconnect(socket: Socket): Promise<void> {
    const user = await this.sessionUsersService.getUserFromSocket(socket.id);
    await this.userService.setOffline(user.sessionId, user.id);
    this.broadcastService.updateUserList(socket, user.sessionId);
  }

  @SubscribeMessage('join')
  async join(
    @MessageBody() joinMsg: UserJoin,
    @ConnectedSocket() socket: Socket,
  ): Promise<User> {
    this.logger.debug(
      `User: ${joinMsg.name} connecting to Session: ${joinMsg.sessionId}`,
    );

    const userDto = plainToInstance(CreateUserDto, {
      name: joinMsg.name,
      online: true,
    })

    const user = await this.userService.createUser(joinMsg.sessionId, userDto);

    this.logger.debug(
      `Storing join information ${socket.id},${user.id},${joinMsg.sessionId}`,
    );

    /*await this.sessionUsersService.join(
      joinMsg.sessionId,
      user.id,
      socket.id,
    ); */
    await socket.join(joinMsg.sessionId);

    this.broadcastService.updateUserList(socket, joinMsg.sessionId);

    return user;
  }

  /*
  @SubscribeMessage('position')
  async identity(@MessageBody() data: Message, @ConnectedSocket() socket: Socket): Promise<number> {

    this.logger.debug(data)
    socket.broadcast.in(data.sessionId).emit('position',data);
    return undefined;
  }
*/


  @OnEvent('update', { async: true })
  async handleUpdateEvent(event: UpdateEvent) {
    this.logger.debug(`Update: ${event.sessionId} ${event.type}`)
    await this.server.to(event.sessionId).emit(event.type, {});
  }
}
