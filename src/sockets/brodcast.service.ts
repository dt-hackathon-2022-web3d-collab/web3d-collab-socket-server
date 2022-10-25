import { Socket } from 'socket.io';

export class BroadcastService {
  public updateUserList(socket: Socket, sessionId: string) {
    socket.broadcast.to(sessionId).emit('users.list', '');
  }

  public updatePosition(socket: Socket, sessionId: string) {
    socket.broadcast.to(sessionId).emit('position', '');
  }

  public updateAnnotationList(socket: Socket, sessionId: string) {
    socket.broadcast.to(sessionId).emit('annotation.list', '');
  }
}
