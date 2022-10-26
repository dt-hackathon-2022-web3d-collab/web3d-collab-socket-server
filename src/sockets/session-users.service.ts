import { CACHE_MANAGER, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SessionUser } from './dto/session-user';

@Injectable()
export class SessionUsersService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  public async join(sessionId: string, userId: string, socketId: string) {
    let user = <SessionUser>await this.cacheManager.get(socketId);
    if (!user) {
      user = {
        id: userId,
        sessionId: sessionId,
        lastTransform: null,
        lastVariant: null,
      };
    }

    console.log('saving socket ' + socketId);
    return this.saveUser(socketId, user);
  }

  public async getUserFromSocket(socketId: string): Promise<SessionUser> {

    const user = await this.getUser(socketId);
    if (!user) {
      throw new NotFoundException(`User not found for socket ${socketId}`);
    }
    return user;


  }

  public async transform(
    socketId: string,
    transform: any,
  ): Promise<SessionUser> {
    const user = await this.getUser(socketId);

    user.lastTransform = transform;
    await this.saveUser(socketId, user);
    return user;
  }

  public async changeVariant(
    socketId: string,
    lastVariant: any,
  ): Promise<SessionUser> {
    const user = await this.getUser(socketId);

    user.lastVariant = lastVariant;
    await this.saveUser(socketId, user);
    return user;
  }

  public async getUser(
    socketId: string,
  ): Promise<SessionUser> {
    const user = <SessionUser>(
      await this.cacheManager.get(socketId)
    );

    if (!user) {
      throw new NotFoundException(`User ID for socket ${socketId} not found`);
    }

    return user;
  }


  private async saveUser(socketId: string, user: SessionUser): Promise<void> {
    await this.cacheManager.set(socketId, user, 0);
  }

}
