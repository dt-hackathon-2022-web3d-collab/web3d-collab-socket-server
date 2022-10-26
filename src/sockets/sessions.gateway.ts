import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { UserService } from '../crud/users.service';
import { UserJoin } from './dto/message.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateEvent } from './events/update-event';
import { SessionUsersService } from './session-users.service';
import { User } from 'src/crud/entities/user.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SessionsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(SessionsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly userService: UserService,
    private readonly sessionUsersService: SessionUsersService,
  ) {}

  async handleConnection(socket: Socket, ...args: any[]) {
    this.logger.debug(
      `Connecting socket ${socket.id} coming from ${socket.handshake.address}`,
    );
    await this.sessionUsersService.join(
      '',
      '',
      socket.id,
      socket.handshake.address,
    );
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    try {
      this.logger.debug(
        `Disconnecting user for socket ${socket.id} coming from ${socket.handshake.address} `,
      );
      const user = await this.sessionUsersService.getUserFromSocket(socket.id);
      this.logger.debug(
        `Setting user "${user.id}" for session "${user.sessionId}" offline`,
      );
      if (user.sessionId !== '') {
        await this.userService.setOffline(user.sessionId, user.id);

        this.logger.debug(
          `Broadcasting user list message to session ${user.sessionId}`,
        );
        this.updateUserList(socket, user.sessionId);
      }
      this.logger.debug(`Removing socket ${socket.id} from list`);
      await this.sessionUsersService.leave(socket.id);
    } catch (exception) {
      this.logger.error(exception);
    }
  }

  @SubscribeMessage('join')
  async join(
    @MessageBody() joinMsg: UserJoin,
    @ConnectedSocket() socket: Socket,
  ): Promise<User> {
    let user;

    if (!joinMsg.userId) {
      this.logger.debug(
        `User: ${joinMsg.name} connecting to Session: ${joinMsg.sessionId} coming from ${socket.handshake.address}`,
      );
      const userDto = plainToInstance(CreateUserDto, {
        name: joinMsg.name,
        online: true,
      });
      this.logger.debug(
        `Creating new User ${joinMsg.name} in Session: ${joinMsg.sessionId}`,
      );
      user = await this.userService.createUser(joinMsg.sessionId, userDto);

      this.logger.debug(
        `Storing join information ${socket.id},${user.id},${joinMsg.sessionId}`,
      );
    } else {
      this.logger.debug(
        `User: ${joinMsg.userId} connecting to Session: ${joinMsg.sessionId}`,
      );
      this.logger.debug(
        `Getting existing user ${joinMsg.userId} in session ${joinMsg.sessionId}`,
      );
      user = await this.userService.getUser(joinMsg.sessionId, joinMsg.userId);
    }

    this.logger.debug(
      `Adding socket ${socket.id} to list for session ${joinMsg.sessionId} and user ${user.id} coming from ${socket.handshake.address}`,
    );
    try {
      const joinResult = await this.sessionUsersService.join(
        joinMsg.sessionId,
        user.id,
        socket.id,
        socket.handshake.address,
      );
      this.logger.debug(joinResult);
      this.logger.debug(`socket.join(${joinMsg.sessionId});`);
      const socketJoinResult = await socket.join(joinMsg.sessionId);
      this.logger.debug(socketJoinResult);
      this.logger.debug(
        `Broadcasting user list message to session ${joinMsg.sessionId}`,
      );
      this.updateUserList(socket, joinMsg.sessionId);
    } catch (exception) {
      this.logger.error(exception);
    }
    return user;
  }

  private updateUserList(socket: Socket, sessionId: string) {
    socket.broadcast.to(sessionId).emit('users', {});
  }

  @SubscribeMessage('camera-transform')
  async identity(
    @MessageBody() transform: any,
    @ConnectedSocket() socket: Socket,
  ): Promise<number> {
    this.logger.debug(`Camera transform from socket ${socket.id}`);
    this.logger.debug(JSON.stringify(transform));
    const user = await this.sessionUsersService.transform(socket.id, transform);
    this.logger.debug(
      `Broadcasting Camera transform from user ${user.id} to session ${user.sessionId} coming from ${socket.handshake.address}`,
    );

    //broadcast.

    /* this.server.emit('camera-updated', {
      userId: user.id,
      sessionId: user.sessionId,
      transform,
    }); */
    socket.in(user.sessionId).emit('camera-updated', {
      userId: user.id,
      sessionId: user.sessionId,
      transform,
    });
    return undefined;
  }

  @OnEvent('update', { async: true })
  async handleUpdateEvent(event: UpdateEvent) {
    this.logger.debug(
      `Broadcasting update refresh ${event.type} for ${event.sessionId}`,
    );
    await this.server.to(event.sessionId).emit(event.type, {});
  }
}
