import { IsString, IsNumber, IsEnum, Min, Max, IsOptional, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Pay247Currency } from './create-deposit.dto';

export enum Pay247WithdrawalMethod {
  TRC20 = 'TRC20',
  ERC20 = 'ERC20',
  BEP20 = 'BEP20',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  GCASH = 'GCASH',
  MAYA = 'MAYA',
}

export class UpiAccountDetails {
  @ApiProperty({ description: 'UPI ID', example: 'user@paytm' })
  @IsString()
  upiId: string;
}

export class BankAccountDetails {
  @ApiProperty({ description: 'Account holder name', example: 'John Doe' })
  @IsString()
  accountHolder: string;

  @ApiProperty({ description: 'Bank account number', example: '1234567890' })
  @IsString()
  accountNumber: string;

  @ApiProperty({ description: 'IFSC code', example: 'HDFC0001234' })
  @IsString()
  ifscCode: string;

  @ApiProperty({ description: 'Bank name', example: 'HDFC Bank', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;
}

export class CryptoAccountDetails {
  @ApiProperty({ description: 'Wallet address', example: 'TXyz123...' })
  @IsString()
  walletAddress: string;

  @ApiProperty({ description: 'Network', example: 'TRC20', required: false })
  @IsOptional()
  @IsString()
  network?: string;
}

export class GCashAccountDetails {
  @ApiProperty({ description: 'Mobile number', example: '+639171234567' })
  @IsString()
  mobileNumber: string;

  @ApiProperty({ description: 'Account name', example: 'John Doe' })
  @IsString()
  accountName: string;
}

export class CreateWithdrawalDto {
  @ApiProperty({ description: 'Withdrawal amount', example: 100 })
  @IsNumber()
  @Min(50)
  @Max(100000)
  amount: number;

  @ApiProperty({ description: 'Currency', enum: Pay247Currency, example: 'USDT' })
  @IsEnum(Pay247Currency)
  currency: Pay247Currency;

  @ApiProperty({ description: 'Payment method', enum: Pay247WithdrawalMethod, example: 'TRC20' })
  @IsEnum(Pay247WithdrawalMethod)
  paymentMethod: Pay247WithdrawalMethod;

  @ApiProperty({
    description: 'Account details (structure depends on payment method)',
    example: { upiId: 'user@paytm' }
  })
  @IsObject()
  accountDetails: UpiAccountDetails | BankAccountDetails | CryptoAccountDetails | GCashAccountDetails | any;
}
