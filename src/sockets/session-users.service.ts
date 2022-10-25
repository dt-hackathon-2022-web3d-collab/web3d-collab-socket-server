import { CACHE_MANAGER, Inject, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SessionUser } from './dto/session-user';

export class SessionUsersService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async join(sessionId: string, userId: string, socketId: string) {
    let user = <SessionUser>await this.cacheManager.get(userId);
    if (!user) {
      user = {
        id: userId,
        sessionId: sessionId,
        lastPosition: null,
        lastVariant: null,
      };
    }

    console.log('saving socket ' + socketId);
    await this.cacheManager.set(socketId, { sessionId, id: userId }, 0);
    console.log('saving user');
    return this.saveUser(user);
  }

  public async getUserFromSocket(socketId: string): Promise<SessionUser> {
    const user: any = await this.cacheManager.get(socketId);
    console.log(`user: ${user}`);
    if (user) {
      const socketUser = await this.getUser(user.sessionId, user.id);
      if (socketUser) {
        return socketUser;
      }
    }

    throw new NotFoundException(`User not found for socket ${socketId}`);
  }

  public async changePosition(
    sessionId: string,
    userId: string,
    position: any,
  ) {
    const user = await this.getUser(sessionId, userId);

    user.lastPosition = position;
    return this.saveUser(user);
  }

  public async changeVariant(
    sessionId: string,
    userId: string,
    lastVariant: any,
  ) {
    const user = await this.getUser(sessionId, userId);

    user.lastVariant = lastVariant;
    return this.saveUser(user);
  }

  public async getUser(
    sessionId: string,
    userId: string,
  ): Promise<SessionUser> {
    const user = <SessionUser>(
      await this.cacheManager.get(`${sessionId}:${userId}`)
    );

    if (!user) {
      throw new NotFoundException(`User ID ${userId} not found`);
    }

    return user;
  }

  private async saveUser(user: SessionUser): Promise<void> {
    await this.cacheManager.set(`${user.sessionId}:${user.id}`, user, 0);
  }
}
