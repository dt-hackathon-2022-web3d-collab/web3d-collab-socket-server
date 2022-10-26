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

import { OnEvent } from '@nestjs/event-emitter';
import { UpdateEvent } from './events/update-event';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { SessionUsersService } from './session-users.service';

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
  ) {}

  async handleDisconnect(socket: Socket): Promise<void> {
    try {
      const user = await this.sessionUsersService.getUserFromSocket(socket.id);
      await this.userService.setOffline(user.sessionId, user.id);
      await this.sessionUsersService.leave(socket.id);
      this.broadcastService.updateUserList(socket, user.sessionId);
    } catch (exception) {
      this.logger.error(exception);
    }
  }

  @SubscribeMessage('join')
  async join(
    @MessageBody() joinMsg: UserJoin,
    @ConnectedSocket() socket: Socket,
  ): Promise<User> {
    this.logger.debug(
      `User: ${joinMsg.name} connecting to Session: ${joinMsg.sessionId}`,
    );

    let user;

    if (!joinMsg.userId) {
      const userDto = plainToInstance(CreateUserDto, {
        name: joinMsg.name,
        online: true,
      });

      user = await this.userService.createUser(joinMsg.sessionId, userDto);

      this.logger.debug(
        `Storing join information ${socket.id},${user.id},${joinMsg.sessionId}`,
      );
    } else {
      this.logger.debug(
        `Getting existing user ${joinMsg.userId} in session ${joinMsg.sessionId}`,
      );
      user = await this.userService.getUser(joinMsg.sessionId, joinMsg.userId);
    }

    await this.sessionUsersService.join(joinMsg.sessionId, user.id, socket.id);
    await socket.join(joinMsg.sessionId);

    this.broadcastService.updateUserList(socket, joinMsg.sessionId);

    return user;
  }

  @SubscribeMessage('camera-transform')
  async identity(
    @MessageBody() transform: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<number> {
    this.logger.debug(`Camera transform`);
    this.logger.debug(transform);
    const user = await this.sessionUsersService.transform(socket.id, transform);
    socket.broadcast.in(user.sessionId).emit('camera-transform', {
      userId: user.id,
      sessionId: user.sessionId,
      transform,
    });
    return undefined;
  }

  @OnEvent('update', { async: true })
  async handleUpdateEvent(event: UpdateEvent) {
    this.logger.debug(`Update: ${event.sessionId} ${event.type}`);
    await this.server.to(event.sessionId).emit(event.type, {});
  }
}
