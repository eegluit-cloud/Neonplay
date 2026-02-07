import { IsString, IsNotEmpty } from 'class-validator';

export class HuiduCallbackDto {
  @IsString()
  @IsNotEmpty()
  agency_uid!: string;

  @IsString()
  @IsNotEmpty()
  payload!: string;

  @IsString()
  @IsNotEmpty()
  timestamp!: string;
}
