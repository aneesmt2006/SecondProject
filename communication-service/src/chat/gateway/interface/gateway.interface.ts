import { Socket } from 'socket.io';
import { TMessageDTO } from 'src/dtos/message.dto';

export interface IWebSocketGateway {
  handleMessage(payload: TMessageDTO, client: Socket): Promise<void>;
}
