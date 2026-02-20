import {
    Controller,
    Get,
    Post,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { BonusService } from './bonus.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('bonus')
@UseGuards(JwtAuthGuard)
export class BonusController {
    constructor(private readonly bonusService: BonusService) { }

    /**
     * GET /bonus/available
     * List all available (claimable) bonuses for the authenticated user.
     */
    @Get('available')
    async getAvailableBonuses(@Req() req: any) {
        return this.bonusService.getAvailableBonuses(req.user.sub);
    }

    /**
     * GET /bonus/active
     * List all active bonuses with wagering progress.
     */
    @Get('active')
    async getActiveBonuses(@Req() req: any) {
        return this.bonusService.getActiveBonuses(req.user.sub);
    }

    /**
     * GET /bonus/history
     * List completed/expired/cancelled bonuses.
     */
    @Get('history')
    async getBonusHistory(
        @Req() req: any,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        return this.bonusService.getBonusHistory(
            req.user.sub,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 20,
        );
    }

    /**
     * POST /bonus/:id/claim
     * Claim an available bonus.
     */
    @Post(':id/claim')
    async claimBonus(@Req() req: any, @Param('id') userPromotionId: string) {
        return this.bonusService.claimBonus(req.user.sub, userPromotionId);
    }
}
