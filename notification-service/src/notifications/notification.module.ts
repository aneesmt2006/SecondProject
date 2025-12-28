import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Notification, NotificationSchema } from './models/notification.module';
import { NotificationConsumer } from './controller/appoinment.consumer';
import { NotificationService } from './services/notification.service';
import { NotificationRepositoryPort } from './repositories/abstraction/notification.repository.abstraction';
import { NotificationServicePort } from './services/abstraction/service.notification.abstraction';
import { MongoNotificationRepository } from './repositories/notification.repository';
import { NotificationGateway } from './gateways/notification.gateway';
import { WebSocketGatewayPort } from './gateways/abstraction/notification.abstraction.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Notification.name, schema: NotificationSchema },
    ]),
  ],

  controllers: [NotificationConsumer],
  providers: [
    NotificationService,
    NotificationGateway,
    {
      provide: NotificationServicePort,
      useClass: NotificationService,
    },
    {
      provide: NotificationRepositoryPort,
      useClass: MongoNotificationRepository,
    },
    {
      provide: WebSocketGatewayPort,
      useClass: NotificationGateway,
    },
  ],
})
export class NotificationModule {}
