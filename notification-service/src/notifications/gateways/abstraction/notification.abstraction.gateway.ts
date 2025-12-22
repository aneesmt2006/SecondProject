import { WebSocketPayload } from 'src/notifications/utils/type.utils';

export abstract class WebSocketGatewayPort {
  abstract SendToUser(userId: string, payload: WebSocketPayload): void;
}
