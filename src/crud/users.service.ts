import { HttpService } from '@nestjs/axios';
import {
  Injectable
} from '@nestjs/common';
import { lastValueFrom } from 'rxjs';

import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService
  ) {}

  async createUser(
    sessionId: string,
    createUserDto: any,
  ): Promise<User> {
    return new User();
   /*const userOb = this.httpService.post(`http://localhost:9999/sessions/${sessionId}/users`,{

   });

   return lastValueFrom(userOb); */
  }

  
  async setOnline(sessionId: string, userId: string): Promise<User> {
    return new User();
    //return await this.updateUser(sessionId, userId, { online: true });
  }

  async setOffline(sessionId: string, userId: string): Promise<User> {
    return new User();
    //return await this.updateUser(sessionId, userId, { online: false });
  }
}
