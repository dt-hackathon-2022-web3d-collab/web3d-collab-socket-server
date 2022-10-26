import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { UserService } from 'src/crud/users.service';
import { Cache } from 'cache-manager';

@Injectable()
export class SessionsCleanup {
  private readonly logger = new Logger(SessionsCleanup.name);

  constructor(
    private readonly userService: UserService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async cleanup() {
    this.logger.debug('Cleaning up sessions');
    let sockets = await this.cacheManager.get('SOCKET_LIST');

    if (!sockets) {
      sockets = {};
    }

    const sessions = {};
    Object.keys(sockets).forEach((key: string) => {
      const socket = sockets[key];
      if (!sessions[socket.sessionId]) {
        sessions[socket.sessionId] = [];
      }
      sessions[socket.sessionId].push(socket.userId);
    });

    const promises = Object.keys(sessions)
      .filter((sessionId: string) => {
        return sessionId !== '';
      })
      .map((sessionId: string) => {
        const users = sessions[sessionId];
        return this.userService.cleanSessions(sessionId, users);
      });

    await Promise.all(promises);
  }
}
