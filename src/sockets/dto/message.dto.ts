export abstract class Message {
  public sessionId: string;
}

export class UserJoin extends Message {
  name: string;
  userId?: string;
}
