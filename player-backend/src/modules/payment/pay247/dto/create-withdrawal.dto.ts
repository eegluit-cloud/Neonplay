import { IsNumber, IsString, IsOptional, Min, ValidateIf } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateWithdrawalDto {
  // UPI Details (India)
  @ApiProperty({ description: 'UPI ID for India withdrawals', required: false })
  @IsOptional()
  @IsString()
  upiId?: string;

  // Bank Details
  @ApiProperty({ description: 'Account holder name', required: false })
  @IsOptional()
  @IsString()
  accountHolder?: string;

  @ApiProperty({ description: 'Bank account number', required: false })
  @IsOptional()
  @IsString()
  accountNumber?: string;

  @ApiProperty({ description: 'IFSC code for India', required: false })
  @IsOptional()
  @IsString()
  ifscCode?: string;

  // Crypto Details
  @ApiProperty({ description: 'Crypto wallet address', required: false })
  @IsOptional()
  @IsString()
  walletAddress?: string;

  // E-Wallet Details (GCash, PayMaya, etc.)
  @ApiProperty({ description: 'Mobile number for e-wallet', required: false })
  @IsOptional()
  @IsString()
  mobileNumber?: string;

  @ApiProperty({ description: 'Account name for e-wallet', required: false })
  @IsOptional()
  @IsString()
  accountName?: string;

  // Common fields
  @ApiProperty({ description: 'Withdrawal amount', example: 1000, minimum: 1 })
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
}
