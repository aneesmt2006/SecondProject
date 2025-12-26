import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../models/notification.module';
import { NotificationRepositoryPort } from './abstraction/notification.repository.abstraction';
import { CreateNotificationModel } from '../utils/type.utils';

@Injectable()
export class MongoNotificationRepository implements NotificationRepositoryPort {
  constructor(
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}

  async createNotification(data: CreateNotificationModel): Promise<void> {
    await this.notificationModel.create(data);
  }
}
