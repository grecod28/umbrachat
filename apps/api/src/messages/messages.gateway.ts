import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(3002)
export class MessagesGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  handleConnection(client: Socket) {
    console.log('New user connecter...', client.id);

    this.server.emit('user-joined', {
      message: `User joined the chat ${client.id}`,
    });
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected...', client.id);

    this.server.emit('user-left', {
      message: `User Left the chat ${client.id}`,
    });
  }

  @WebSocketServer()
  server!: Server;

  @SubscribeMessage('message')
  handleMessage(client: Socket, msg: string) {
    console.log(msg);
    client.emit('reply', 'This is a reply');
    this.server.emit('reply', 'Broadcasting...');
  }
}
