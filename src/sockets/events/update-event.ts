export class UpdateEvent {
    constructor(public readonly type: string, public readonly sessionId: string) {}
}