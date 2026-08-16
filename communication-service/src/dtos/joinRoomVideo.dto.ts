export interface JoinRoomDto {
  id: string;
  name: string;
  role?: 'doctor' | 'user';
  users: string[];
}
