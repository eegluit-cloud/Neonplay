import { IsNumber, IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateDepositDto {
  @ApiProperty({
    description: 'Deposit amount',
    example: 1000,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  amount!: number;

  @ApiProperty({ description: 'Currency code', example: 'PHP' })
  @IsString()
  currency!: string;

  @ApiProperty({ description: 'Payment method', example: 'GCASH' })
  @IsString()
  paymentMethod!: string;

  @ApiProperty({ description: 'Return URL after payment', required: false })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiProperty({ description: 'Payment theme', required: false })
  @IsOptional()
  @IsString()
  theme?: string;
}
