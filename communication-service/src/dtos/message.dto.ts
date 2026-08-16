export type TMessageDTO = {
  userId: string;
  doctorId: string;
  senderType: 'user' | 'doctor' | 'admin';
  senderId: string;
  messageText: string;
  attachmentUrl: string;
  readStatus: boolean;
};
