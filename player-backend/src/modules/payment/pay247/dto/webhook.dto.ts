import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class Pay247WebhookDto {
  @ApiProperty({ description: 'Merchant ID' })
  @IsString()
  mch_id!: string;

  @ApiProperty({ description: 'Order number from Pay247' })
  @IsString()
  order_no!: string;

  @ApiProperty({ description: 'Merchant order number' })
  @IsString()
  mch_order_no!: string;

  @ApiProperty({ description: 'Transaction amount as string' })
  @IsString()
  amount!: string;

  @ApiProperty({ description: 'Currency' })
  @IsString()
  currency!: string;

  @ApiProperty({ description: 'Transaction status (uppercase)' })
  @IsIn(['SUCCESS', 'FAILED', 'PENDING', 'PROCESSING'])
  status!: string;

  @ApiProperty({ description: 'Payment method used' })
  @IsString()
  pay_method!: string;

  @ApiProperty({ description: 'Transaction fee', required: false })
  @IsOptional()
  @IsString()
  fee?: string;

  @ApiProperty({ description: 'Error message if failed', required: false })
  @IsOptional()
  @IsString()
  error?: string;

  @ApiProperty({ description: 'Order creation timestamp in milliseconds' })
  @IsNumber()
  created_at!: number;

  @ApiProperty({ description: 'Payment completion timestamp in milliseconds' })
  @IsNumber()
  paid_at!: number;

  @ApiProperty({ description: 'MD5 signature for verification' })
  @IsString()
  sign!: string;
}
