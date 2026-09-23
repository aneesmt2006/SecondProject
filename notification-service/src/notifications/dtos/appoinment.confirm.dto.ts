import { IsNotEmpty, IsString } from 'class-validator';

export class AppoinmentConfirmedDTO {
  @IsNotEmpty()
  @IsString()
  appointmentId!: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @IsNotEmpty()
  @IsString()
  appointmentDate: string;

  @IsNotEmpty()
  @IsString()
  appointmentTime: string;
}
