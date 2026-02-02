import { IsString, IsNumber, IsEnum, Min, Max, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum Pay247Currency {
  USDT = 'USDT',
  INR = 'INR',
  PHP = 'PHP',
}

export enum Pay247DepositMethod {
  TRC20 = 'TRC20',
  ERC20 = 'ERC20',
  BEP20 = 'BEP20',
  UPI = 'UPI',
  UPI_INTENT = 'UPI_INTENT',
  BANK_TRANSFER = 'BANK_TRANSFER',
  GCASH = 'GCASH',
  MAYA = 'MAYA',
}

export class CreateDepositDto {
  @ApiProperty({ description: 'Deposit amount', example: 100 })
  @IsNumber()
  @Min(10)
  @Max(100000)
  amount: number;

  @ApiProperty({ description: 'Currency', enum: Pay247Currency, example: 'USDT' })
  @IsEnum(Pay247Currency)
  currency: Pay247Currency;

  @ApiProperty({ description: 'Payment method', enum: Pay247DepositMethod, example: 'TRC20' })
  @IsEnum(Pay247DepositMethod)
  paymentMethod: Pay247DepositMethod;

  @ApiProperty({ description: 'Return URL after payment', required: false })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiProperty({ description: 'Payment theme', enum: ['link', 'custom'], default: 'link' })
  @IsOptional()
  @IsIn(['link', 'custom'])
  theme?: 'link' | 'custom';
}
