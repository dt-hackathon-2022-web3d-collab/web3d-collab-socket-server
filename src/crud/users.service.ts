import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { CreateUserDto } from 'src/sockets/dto/create-user.dto';
import { UserDto } from 'src/sockets/dto/user.dto';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(
    sessionId: string,
    createUserDto: CreateUserDto,
  ): Promise<UserDto> {
    console.log(
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
    console.log(
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
}
