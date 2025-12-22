import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from './config/env.config';
import { NotificationModule } from './notifications/notification.module';

@Module({
  imports: [MongooseModule.forRoot(config.mongoUrl!), NotificationModule],
})
export class AppModule {}
