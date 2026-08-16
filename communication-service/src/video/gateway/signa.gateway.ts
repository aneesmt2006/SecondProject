/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConnectedSocket, Offer } from '../interfaces/offer.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  // namespace: '/video',
})
export class VideoGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server!: Server;
  private offers: Offer[] = [];
  private connectedSockets: ConnectedSocket[] = [];

  handleConnection(client: Socket) {
    console.log('User Handle connection video ', client.id);
    const userName = client.handshake.auth.userName as string;
    const password = client.handshake.auth.password as string;

    if (password !== 'x') {
      client.disconnect(true);
      return;
    }

    this.connectedSockets.push({ socketId: client.id, userName });
    if (this.offers.length) client.emit('availabeOffers', this.offers);
  }

  handleDisconnect(client: Socket) {
    console.log('User Handle Disconnect video ', client.id);
    this.connectedSockets.filter((s) => s.socketId !== client.id);
    this.offers = this.offers.filter((s) => s.socketId !== client.id);
  }

  // New offer handler
  @SubscribeMessage('newOffer')
  handleNewOffer(client: Socket, newOffer: any) {
    const userName = client.handshake.auth.userName as string;

    const newOfferEntry: Offer = {
      offererUserName: userName,
      offer: newOffer,
      offerIceCandidates: [],
      answererUserName: null,
      answer: null,
      answererIceCandidates: [],
      socketId: client.id,
    };

    this.offers = this.offers.filter((o) => o.offererUserName !== userName); // prevent existing duplicates offer from the same user
    this.offers.push(newOfferEntry);
    client.broadcast.emit('newOfferAwaiting', [newOfferEntry]);
  }

  // Answer handler with ICE candidate acknowledgement
  @SubscribeMessage('newAnswer')
  handleNewAnswer(client: Socket, offerObj: any) {
    const userName = client.handshake.auth.userName as string;
    const offerToUpdate = this.offers.find(
      (o) => o.offererUserName === offerObj.offererUserName,
    );

    if (!offerToUpdate) return;

    // send existing ICE candidates to answerer
    client.emit('existingICEcandidates', offerToUpdate.offerIceCandidates);

    // update offer with answer information
    offerToUpdate.answer = offerObj.answer;
    offerToUpdate.answererUserName = userName;
    offerToUpdate.answererSocketId = client.id;

    // Notify both parties
    this.server
      .to(offerToUpdate.socketId)
      .emit('answerResponse', offerToUpdate);
    client.emit('answerConfirmation', offerToUpdate);
  }

  // ICE candidate handler with storage
  @SubscribeMessage('sendIceCandidateToSignalingServer')
  handleIceCandidate(client: Socket, iceCandidateObj: any) {
    const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;

    // store candidate in the offer object
    const offer = this.offers.find((o) =>
      didIOffer
        ? o.offererUserName === iceUserName
        : o.answererUserName === iceUserName,
    );

    if (offer) {
      if (didIOffer) {
        offer.offerIceCandidates.push(iceCandidate);
      } else {
        offer.answererIceCandidates.push(iceCandidate);
      }
    }

    // forwarded candidate to other peer
    const targetUserName = didIOffer
      ? offer?.answererUserName
      : offer?.offererUserName;

    const targetSocket = this.connectedSockets.find(
      (s) => s.userName === targetUserName,
    );

    if (targetSocket) {
      this.server
        .to(targetSocket.socketId)
        .emit('recievedIceCandidateFromServer', iceCandidate);
    }
  }
}
