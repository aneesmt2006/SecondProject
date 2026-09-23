import { Module } from '@nestjs/common';
import { SignalingGateway } from './gateway/signaling.gateway';
@Module({
  providers: [SignalingGateway],
})
export class SignalingModule {}
