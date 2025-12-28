import { IsNotEmpty, IsString, IsArray } from 'class-validator';

export class AbnormalityDTO {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  age: string;

  @IsNotEmpty()
  @IsString()
  week: string;

  @IsNotEmpty()
  @IsString()
  trimester: string;

  @IsNotEmpty()
  @IsString()
  isFirstPregnancy: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  abnormalSymptoms: string[];

  @IsNotEmpty()
  @IsString()
  doctorId: string;
}
