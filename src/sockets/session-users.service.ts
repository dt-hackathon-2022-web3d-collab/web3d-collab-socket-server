import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import { SessionUser } from './dto/session-user';

@Injectable()
export class SessionUsersService {
  private readonly logger = new Logger(SessionUsersService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  public async join(
    sessionId: string,
    userId: string,
    socketId: string,
    address?: string,
  ) {
    let user = <SessionUser>await this.cacheManager.get(socketId);
    if (!user) {
      user = {
        id: userId,
        sessionId: sessionId,
        lastTransform: null,
        lastVariant: null,
        address,
      };
    } else {
      this.logger.debug(`Found existing user`);
      this.logger.debug(JSON.stringify(user));
      user.address = address;
    }

    this.logger.debug(`Saving socket ${socketId}`);
    return this.saveUser(socketId, user);
  }

  public async leave(socketId: string): Promise<void> {
    this.logger.debug(`Removing socket ${socketId}`);
    await this.cacheManager.del(socketId);
  }

  public async getUserFromSocket(socketId: string): Promise<SessionUser> {
    const user = await this.getUser(socketId);
    if (!user) {
      this.logger.error(`User not found for socket ${socketId}`);
      throw new NotFoundException(`User not found for socket ${socketId}`);
    }
    return user;
  }

  public async transform(
    socketId: string,
    transform: any,
  ): Promise<SessionUser> {
    const user = await this.getUser(socketId);
    this.logger.debug(`Saving last transform for user ${user.id}`);
    user.lastTransform = transform;
    await this.saveUser(socketId, user);
    return user;
  }

  public async changeVariant(
    socketId: string,
    lastVariant: any,
  ): Promise<SessionUser> {
    const user = await this.getUser(socketId);
    this.logger.debug(`Saving last variant for user ${user.id}`);
    user.lastVariant = lastVariant;
    await this.saveUser(socketId, user);
    return user;
  }

  public async getUser(socketId: string): Promise<SessionUser> {
    const user = <SessionUser>await this.cacheManager.get(socketId);

    if (!user) {
      this.logger.error(`User ID for socket ${socketId} not found`);
      throw new NotFoundException(`User ID for socket ${socketId} not found`);
    }

    return user;
  }

  private async saveUser(socketId: string, user: SessionUser): Promise<void> {
    this.logger.debug(`Saving user ${user.id} for socket ${socketId}`);
    await this.cacheManager.set(socketId, user, 10000000);
  }
}
