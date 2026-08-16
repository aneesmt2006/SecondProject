import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
// import * as Joi from 'joi';
import { SignalingGateway } from './gateway/signaling.gateway';
@Module({
  providers: [SignalingGateway],
})
export class SignalingModule {}
