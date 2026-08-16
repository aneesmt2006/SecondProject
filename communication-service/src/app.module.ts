import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config/env.config';

import { ChatModule } from './chat/chat.module';
import { SignalingModule } from './video/video.module';
@Module({
  imports: [
    MongooseModule.forRoot(config.mongoUrl!),
    ChatModule,
    SignalingModule,
  ],
})
export class AppModule {}
