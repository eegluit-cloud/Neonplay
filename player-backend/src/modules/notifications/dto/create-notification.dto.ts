import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, IsUrl, IsObject, MaxLength } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'Notification type',
    enum: ['system', 'promotion', 'wallet', 'game', 'leaderboard', 'bet'],
  })
  @IsString()
  @IsIn(['system', 'promotion', 'wallet', 'game', 'leaderboard', 'bet'])
  type!: string;

  @ApiProperty({ description: 'Notification title', example: 'Welcome Bonus!' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ description: 'Notification message', example: 'You have received 1,000 GC!' })
  @IsString()
  @MaxLength(1000)
  message!: string;

  @ApiPropertyOptional({ description: 'Action URL for the notification' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Image URL for the notification' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'Additional data as JSON' })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;
}
