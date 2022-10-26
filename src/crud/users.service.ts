import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CreateUserDto } from 'src/sockets/dto/create-user.dto';
import { UserDto } from 'src/sockets/dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(
    sessionId: string,
    createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    this.logger.debug(
      `POST ${this.configService.get(
        'ENDPOINT',
      )}/v1/sessions/${sessionId}/users`,
    );
    const userOb = this.httpService.post(
      `${this.configService.get('ENDPOINT')}/v1/sessions/${sessionId}/users`,
      {
        ...createUserDto,
      },
    );
    return (await lastValueFrom(userOb)).data;
  }

  async getUser(sessionId: string, userId: string): Promise<UserDto> {
    this.logger.debug(
      `GET ${this.configService.get(
        'ENDPOINT',
      )}/v1/sessions/${sessionId}/users/${userId}`,
    );
    const userOb = this.httpService.get(
      `${this.configService.get(
        'ENDPOINT',
      )}/v1/sessions/${sessionId}/users/${userId}`,
    );
    return (await lastValueFrom(userOb)).data;
  }

  async setOnline(sessionId: string, userId: string): Promise<User> {
    this.logger.debug(
      `PATCH ${this.configService.get(
        'ENDPOINT',
      )}/v1/sessions/${sessionId}/users/${userId}`,
    );
    const userOb = this.httpService.patch(
      `${this.configService.get(
        'ENDPOINT',
      )}/v1/sessions/${sessionId}/users/${userId}`,
      {
        online: true,
      },
    );
    return (await lastValueFrom(userOb)).data;
  }

  async setOffline(sessionId: string, userId: string): Promise<User> {
    this.logger.debug(
      `PATCH ${this.configService.get(
        'ENDPOINT',
      )}/v1/sessions/${sessionId}/users/${userId}`,
    );
    const userOb = this.httpService.patch(
      `${this.configService.get(
        'ENDPOINT',
      )}/v1/sessions/${sessionId}/users/${userId}`,
      {
        online: false,
      },
    );
    return (await lastValueFrom(userOb)).data;
  }

  public async cleanSessions(sessionId: string, users: string[]) {
    this.logger.debug(
      `POST ${this.configService.get(
        'ENDPOINT',
      )}/v1/sessions/${sessionId}/users/clean`,
    );
    const userOb = this.httpService.post(
      `${this.configService.get(
        'ENDPOINT',
      )}/v1/sessions/${sessionId}/users/clean`,
      {
        onlineUserId: users,
      },
    );
    return (await lastValueFrom(userOb)).data;
  }
}
