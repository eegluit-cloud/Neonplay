import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ description: 'Receive promotional emails' })
  @IsOptional()
  @IsBoolean()
  emailPromotions?: boolean;

  @ApiPropertyOptional({ description: 'Receive transaction emails' })
  @IsOptional()
  @IsBoolean()
  emailTransactions?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Receive promotional push notifications' })
  @IsOptional()
  @IsBoolean()
  pushPromotions?: boolean;

  @ApiPropertyOptional({ description: 'Receive transaction push notifications' })
  @IsOptional()
  @IsBoolean()
  pushTransactions?: boolean;

  @ApiPropertyOptional({ description: 'Enable SMS notifications' })
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;
}
