import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaginationDto } from '../../../common/utils/pagination.util';

export class GetNotificationsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by read status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by notification type',
    enum: ['system', 'promotion', 'wallet', 'game', 'leaderboard', 'bet'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['system', 'promotion', 'wallet', 'game', 'leaderboard', 'bet'])
  type?: string;
}
