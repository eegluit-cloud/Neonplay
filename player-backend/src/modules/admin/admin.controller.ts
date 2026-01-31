import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Request } from 'express';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { PaginationDto } from '../../common/utils/pagination.util';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ==========================================
  // AUTHENTICATION
  // ==========================================

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || req.socket.remoteAddress || '';
    const userAgent = req.headers['user-agent'] || '';
    return this.adminService.login(email, password, ipAddress, userAgent);
  }

  @UseGuards(AdminAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Admin logout' })
  async logout(@Req() req: Request) {
    const admin = (req as any).admin;
    const token = req.headers.authorization?.replace('Bearer ', '');
    await this.adminService.logout(admin.id, token);
    return { message: 'Logged out successfully' };
  }

  @UseGuards(AdminAuthGuard)
  @Get('me')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get current admin profile' })
  async getMe(@Req() req: Request) {
    const admin = (req as any).admin;
    return this.adminService.getMe(admin.id);
  }

  // ==========================================
  // USER MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('users')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List users with pagination and filtering' })
  async listUsers(@Query() query: any) {
    return this.adminService.listUsers(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('users/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get user by ID with full details' })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('users/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Update user details' })
  async updateUser(
    @Req() req: Request,
    @Param('id') userId: string,
    @Body() data: any,
  ) {
    const admin = (req as any).admin;
    return this.adminService.updateUser(admin.id, userId, data);
  }

  @UseGuards(AdminAuthGuard)
  @Post('users/:id/suspend')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Suspend a user' })
  async suspendUser(
    @Req() req: Request,
    @Param('id') userId: string,
    @Body('reason') reason: string,
  ) {
    const admin = (req as any).admin;
    return this.adminService.suspendUser(admin.id, userId, reason);
  }

  @UseGuards(AdminAuthGuard)
  @Post('users/:id/unsuspend')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Unsuspend a user' })
  async unsuspendUser(@Req() req: Request, @Param('id') userId: string) {
    const admin = (req as any).admin;
    return this.adminService.unsuspendUser(admin.id, userId);
  }

  @UseGuards(AdminAuthGuard)
  @Post('users/:id/verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Manually verify a user' })
  async verifyUser(@Req() req: Request, @Param('id') userId: string) {
    const admin = (req as any).admin;
    return this.adminService.verifyUser(admin.id, userId);
  }

  @UseGuards(AdminAuthGuard)
  @Post('users/:id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Force password reset for user' })
  async forcePasswordReset(@Req() req: Request, @Param('id') userId: string) {
    const admin = (req as any).admin;
    return this.adminService.forcePasswordReset(admin.id, userId);
  }

  @UseGuards(AdminAuthGuard)
  @Get('users/:id/transactions')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get user transaction history' })
  async getUserTransactions(
    @Param('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.adminService.getUserTransactions(userId, query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('users/:id/activity')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get user activity log' })
  async getUserActivity(
    @Param('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.adminService.getUserActivity(userId, query);
  }

  // ==========================================
  // GAME MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('games')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List all games' })
  async listGames(@Query() query: any) {
    return this.adminService.listGames(query);
  }

  @UseGuards(AdminAuthGuard)
  @Post('games')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Add new game' })
  async createGame(@Req() req: Request, @Body() data: any) {
    const admin = (req as any).admin;
    return this.adminService.createGame(admin.id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Get('games/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get game details' })
  async getGame(@Param('id') id: string) {
    return this.adminService.getGame(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('games/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Update game' })
  async updateGame(
    @Req() req: Request,
    @Param('id') gameId: string,
    @Body() data: any,
  ) {
    const admin = (req as any).admin;
    return this.adminService.updateGame(admin.id, gameId, data);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('games/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Soft delete game' })
  async deleteGame(@Req() req: Request, @Param('id') gameId: string) {
    const admin = (req as any).admin;
    return this.adminService.deleteGame(admin.id, gameId);
  }

  @UseGuards(AdminAuthGuard)
  @Post('games/:id/toggle')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Enable/disable game' })
  async toggleGame(@Req() req: Request, @Param('id') gameId: string) {
    const admin = (req as any).admin;
    return this.adminService.toggleGame(admin.id, gameId);
  }

  @UseGuards(AdminAuthGuard)
  @Post('games/bulk-import')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Bulk import games' })
  async bulkImportGames(@Req() req: Request, @Body() data: any[]) {
    const admin = (req as any).admin;
    return this.adminService.bulkImportGames(admin.id, data);
  }

  // ==========================================
  // PROVIDER MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('providers')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List game providers' })
  async listProviders(@Query() query: any) {
    return this.adminService.listProviders(query);
  }

  @UseGuards(AdminAuthGuard)
  @Post('providers')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Add game provider' })
  async createProvider(@Req() req: Request, @Body() data: any) {
    const admin = (req as any).admin;
    return this.adminService.createProvider(admin.id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('providers/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Update game provider' })
  async updateProvider(
    @Req() req: Request,
    @Param('id') providerId: string,
    @Body() data: any,
  ) {
    const admin = (req as any).admin;
    return this.adminService.updateProvider(admin.id, providerId, data);
  }

  // ==========================================
  // TRANSACTION MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('transactions')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List all transactions' })
  async listTransactions(@Query() query: any) {
    return this.adminService.listTransactions(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('transactions/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get transaction details' })
  async getTransaction(@Param('id') id: string) {
    return this.adminService.getTransaction(id);
  }

  @UseGuards(AdminAuthGuard)
  @Post('transactions/adjustment')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Manual balance adjustment' })
  async createAdjustment(
    @Req() req: Request,
    @Body() data: { userId: string; coinType: string; amount: number; reason: string },
  ) {
    const admin = (req as any).admin;
    return this.adminService.createAdjustment(admin.id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Get('transactions/summary')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get transaction summary stats' })
  async getTransactionSummary(@Query() query: any) {
    return this.adminService.getTransactionSummary(query);
  }

  // ==========================================
  // REDEMPTION MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('redemptions')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List redemption requests' })
  async listRedemptions(@Query() query: any) {
    return this.adminService.listRedemptions(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('redemptions/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get redemption details' })
  async getRedemption(@Param('id') id: string) {
    return this.adminService.getRedemption(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('redemptions/:id/approve')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Approve redemption' })
  async approveRedemption(@Req() req: Request, @Param('id') redemptionId: string) {
    const admin = (req as any).admin;
    return this.adminService.approveRedemption(admin.id, redemptionId);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('redemptions/:id/reject')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Reject redemption' })
  async rejectRedemption(
    @Req() req: Request,
    @Param('id') redemptionId: string,
    @Body('reason') reason: string,
  ) {
    const admin = (req as any).admin;
    return this.adminService.rejectRedemption(admin.id, redemptionId, reason);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('redemptions/:id/process')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Mark redemption as processing' })
  async processRedemption(@Req() req: Request, @Param('id') redemptionId: string) {
    const admin = (req as any).admin;
    return this.adminService.processRedemption(admin.id, redemptionId);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('redemptions/:id/complete')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Mark redemption as completed' })
  async completeRedemption(@Req() req: Request, @Param('id') redemptionId: string) {
    const admin = (req as any).admin;
    return this.adminService.completeRedemption(admin.id, redemptionId);
  }

  // ==========================================
  // AMOE MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('amoe')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List AMOE entries' })
  async listAmoeEntries(@Query() query: any) {
    return this.adminService.listAmoeEntries(query);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('amoe/:id/approve')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Approve AMOE entry' })
  async approveAmoeEntry(@Req() req: Request, @Param('id') entryId: string) {
    const admin = (req as any).admin;
    return this.adminService.approveAmoeEntry(admin.id, entryId);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('amoe/:id/reject')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Reject AMOE entry' })
  async rejectAmoeEntry(
    @Req() req: Request,
    @Param('id') entryId: string,
    @Body('reason') reason: string,
  ) {
    const admin = (req as any).admin;
    return this.adminService.rejectAmoeEntry(admin.id, entryId, reason);
  }

  // ==========================================
  // PROMOTION MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('promotions')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List promotions' })
  async listPromotions(@Query() query: any) {
    return this.adminService.listPromotions(query);
  }

  @UseGuards(AdminAuthGuard)
  @Post('promotions')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Create promotion' })
  async createPromotion(@Req() req: Request, @Body() data: any) {
    const admin = (req as any).admin;
    return this.adminService.createPromotion(admin.id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('promotions/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Update promotion' })
  async updatePromotion(
    @Req() req: Request,
    @Param('id') promotionId: string,
    @Body() data: any,
  ) {
    const admin = (req as any).admin;
    return this.adminService.updatePromotion(admin.id, promotionId, data);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('promotions/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Delete promotion' })
  async deletePromotion(@Req() req: Request, @Param('id') promotionId: string) {
    const admin = (req as any).admin;
    return this.adminService.deletePromotion(admin.id, promotionId);
  }

  // ==========================================
  // SUPPORT TICKET MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('tickets')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List support tickets' })
  async listTickets(@Query() query: any) {
    return this.adminService.listTickets(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('tickets/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get ticket details' })
  async getTicket(@Param('id') id: string) {
    return this.adminService.getTicket(id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('tickets/:id/assign')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Assign ticket to admin' })
  async assignTicket(
    @Req() req: Request,
    @Param('id') ticketId: string,
    @Body('adminId') assigneeId: string,
  ) {
    const admin = (req as any).admin;
    return this.adminService.assignTicket(admin.id, ticketId, assigneeId);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('tickets/:id/status')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Update ticket status' })
  async updateTicketStatus(
    @Req() req: Request,
    @Param('id') ticketId: string,
    @Body('status') status: string,
  ) {
    const admin = (req as any).admin;
    return this.adminService.updateTicketStatus(admin.id, ticketId, status);
  }

  @UseGuards(AdminAuthGuard)
  @Post('tickets/:id/messages')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Add admin message to ticket' })
  async addTicketMessage(
    @Req() req: Request,
    @Param('id') ticketId: string,
    @Body() data: { message: string; isInternal?: boolean },
  ) {
    const admin = (req as any).admin;
    return this.adminService.addTicketMessage(admin.id, ticketId, data);
  }

  // ==========================================
  // ANALYTICS & REPORTING
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('analytics/dashboard')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get dashboard overview stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @UseGuards(AdminAuthGuard)
  @Get('analytics/users')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get user analytics' })
  async getUserAnalytics(@Query() query: any) {
    return this.adminService.getUserAnalytics(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('analytics/revenue')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get revenue analytics' })
  async getRevenueAnalytics(@Query() query: any) {
    return this.adminService.getRevenueAnalytics(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('analytics/games')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get game performance analytics' })
  async getGameAnalytics(@Query() query: any) {
    return this.adminService.getGameAnalytics(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('analytics/retention')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get user retention metrics' })
  async getRetentionMetrics(@Query() query: any) {
    return this.adminService.getRetentionMetrics(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('reports/transactions')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Export transaction report' })
  async exportTransactionReport(@Query() query: any) {
    return this.adminService.exportTransactionReport(query);
  }

  @UseGuards(AdminAuthGuard)
  @Get('reports/users')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Export user report' })
  async exportUserReport(@Query() query: any) {
    return this.adminService.exportUserReport(query);
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('audit-logs')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Get audit logs' })
  async getAuditLogs(@Query() query: any) {
    return this.adminService.getAuditLogs(query);
  }

  // ==========================================
  // ADMIN USER MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('admins')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List admin users' })
  async listAdmins(@Query() query: any) {
    return this.adminService.listAdmins(query);
  }

  @UseGuards(AdminAuthGuard)
  @Post('admins')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Create admin user' })
  async createAdmin(@Req() req: Request, @Body() data: any) {
    const admin = (req as any).admin;
    return this.adminService.createAdmin(admin.id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admins/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Update admin user' })
  async updateAdmin(
    @Req() req: Request,
    @Param('id') adminId: string,
    @Body() data: any,
  ) {
    const admin = (req as any).admin;
    return this.adminService.updateAdmin(admin.id, adminId, data);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('admins/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Deactivate admin user' })
  async deleteAdmin(@Req() req: Request, @Param('id') adminId: string) {
    const admin = (req as any).admin;
    return this.adminService.deleteAdmin(admin.id, adminId);
  }

  // ==========================================
  // CMS MANAGEMENT
  // ==========================================

  @UseGuards(AdminAuthGuard)
  @Get('pages')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List static pages' })
  async listPages(@Query() query: any) {
    return this.adminService.listPages(query);
  }

  @UseGuards(AdminAuthGuard)
  @Post('pages')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Create static page' })
  async createPage(@Req() req: Request, @Body() data: any) {
    const admin = (req as any).admin;
    return this.adminService.createPage(admin.id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('pages/:slug')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Update static page' })
  async updatePage(
    @Req() req: Request,
    @Param('slug') slug: string,
    @Body() data: any,
  ) {
    const admin = (req as any).admin;
    return this.adminService.updatePage(admin.id, slug, data);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('pages/:slug')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Delete static page' })
  async deletePage(@Req() req: Request, @Param('slug') slug: string) {
    const admin = (req as any).admin;
    return this.adminService.deletePage(admin.id, slug);
  }

  @UseGuards(AdminAuthGuard)
  @Get('announcements')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List announcements' })
  async listAnnouncements(@Query() query: any) {
    return this.adminService.listAnnouncements(query);
  }

  @UseGuards(AdminAuthGuard)
  @Post('announcements')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Create announcement' })
  async createAnnouncement(@Req() req: Request, @Body() data: any) {
    const admin = (req as any).admin;
    return this.adminService.createAnnouncement(admin.id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('announcements/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Update announcement' })
  async updateAnnouncement(
    @Req() req: Request,
    @Param('id') announcementId: string,
    @Body() data: any,
  ) {
    const admin = (req as any).admin;
    return this.adminService.updateAnnouncement(admin.id, announcementId, data);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('announcements/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Delete announcement' })
  async deleteAnnouncement(@Req() req: Request, @Param('id') announcementId: string) {
    const admin = (req as any).admin;
    return this.adminService.deleteAnnouncement(admin.id, announcementId);
  }

  @UseGuards(AdminAuthGuard)
  @Get('hero-banners')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'List hero banners' })
  async listHeroBanners(@Query() query: any) {
    return this.adminService.listHeroBanners(query);
  }

  @UseGuards(AdminAuthGuard)
  @Post('hero-banners')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Create hero banner' })
  async createHeroBanner(@Req() req: Request, @Body() data: any) {
    const admin = (req as any).admin;
    return this.adminService.createHeroBanner(admin.id, data);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('hero-banners/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Update hero banner' })
  async updateHeroBanner(
    @Req() req: Request,
    @Param('id') bannerId: string,
    @Body() data: any,
  ) {
    const admin = (req as any).admin;
    return this.adminService.updateHeroBanner(admin.id, bannerId, data);
  }

  @UseGuards(AdminAuthGuard)
  @Delete('hero-banners/:id')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Delete hero banner' })
  async deleteHeroBanner(@Req() req: Request, @Param('id') bannerId: string) {
    const admin = (req as any).admin;
    return this.adminService.deleteHeroBanner(admin.id, bannerId);
  }

  @UseGuards(AdminAuthGuard)
  @Post('hero-banners/reorder')
  @ApiBearerAuth('Admin-JWT')
  @ApiOperation({ summary: 'Reorder hero banners' })
  async reorderHeroBanners(
    @Req() req: Request,
    @Body() data: { bannerIds: string[] },
  ) {
    const admin = (req as any).admin;
    return this.adminService.reorderHeroBanners(admin.id, data.bannerIds);
  }
}
