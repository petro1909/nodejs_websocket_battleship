import { AddressInfo, WebSocketServer } from 'ws';
import { WSClientsService } from '../service/clientsService';

export const websocketServerStart = (wsPort: number) => {
  const clientService = WSClientsService.getInstance();
  clientService.setCommands();
  const server = new WebSocketServer({ port: wsPort });
  console.log(`Start websocket server on the ${wsPort} port!`);
  server.on('connection', (wsClient, request) => {
    console.log('\x1b[41m%s\x1b[0m', `new client connected on port ${(request.socket.address() as AddressInfo).port}`);
    clientService.connectWsClient(wsClient);
  });
  server.on('close', () => {
    server.clients.forEach((client) => client.terminate());
  });
};
