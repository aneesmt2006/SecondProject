import { IsNotEmpty, IsString } from 'class-validator';
export class refundPaymentDTO {
  @IsNotEmpty()
  @IsString()
  appoinmentId!: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @IsNotEmpty()
  @IsString()
  appoinmentDate: string;

  @IsNotEmpty()
  @IsString()
  appoinmentTime: string;
}
