import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import {
  HelpService,
  FaqQueryDto,
  CreateTicketDto,
  AddMessageDto,
} from './help.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationDto } from '../../common/utils/pagination.util';

@ApiTags('Help')
@Controller('help')
export class HelpController {
  constructor(private readonly helpService: HelpService) {}

  // ==================== FAQ Endpoints ====================

  @Public()
  @Get('faqs')
  @ApiOperation({ summary: 'Get paginated FAQs with filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Category slug' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search term' })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of FAQs',
  })
  async getFaqs(@Query() query: FaqQueryDto) {
    return this.helpService.getFaqs(query);
  }

  @Public()
  @Get('faqs/featured')
  @ApiOperation({ summary: 'Get featured FAQs for help section' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of featured FAQs',
  })
  async getFeaturedFaqs() {
    return this.helpService.getFeaturedFaqs();
  }

  @Public()
  @Get('faqs/search')
  @ApiOperation({ summary: 'Search FAQs by query' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Search query (min 2 characters)' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of matching FAQs',
  })
  @ApiResponse({
    status: 400,
    description: 'Search query too short',
  })
  async searchFaqs(@Query('q') query: string) {
    return this.helpService.searchFaqs(query);
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Get all FAQ categories' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of FAQ categories with counts',
  })
  async getCategories() {
    return this.helpService.getCategories();
  }

  @Public()
  @Get('faqs/:id')
  @ApiOperation({ summary: 'Get FAQ by ID' })
  @ApiParam({ name: 'id', description: 'FAQ ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns FAQ details',
  })
  @ApiResponse({
    status: 404,
    description: 'FAQ not found',
  })
  async getFaqById(@Param('id') id: string) {
    return this.helpService.getFaqById(id);
  }

  // ==================== Support Ticket Endpoints ====================

  @UseGuards(JwtAuthGuard)
  @Post('tickets')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new support ticket' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'Ticket subject',
          example: 'Issue with deposit',
        },
        message: {
          type: 'string',
          description: 'Initial message describing the issue',
          example: 'I made a deposit 2 hours ago but it has not been credited to my account.',
        },
        category: {
          type: 'string',
          description: 'Ticket category',
          enum: ['account', 'deposit', 'withdrawal', 'game', 'bonus', 'verification', 'other'],
          example: 'deposit',
        },
        priority: {
          type: 'string',
          description: 'Ticket priority',
          enum: ['low', 'medium', 'high'],
          example: 'medium',
        },
        attachments: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of attachment URLs',
        },
      },
      required: ['subject', 'message', 'category'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async createTicket(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateTicketDto,
  ) {
    return this.helpService.createTicket(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user support tickets' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of user tickets',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  async getUserTickets(
    @CurrentUser('id') userId: string,
    @Query() query: PaginationDto,
  ) {
    return this.helpService.getUserTickets(userId, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tickets/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get ticket details with messages' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns ticket details with all messages',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not your ticket',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async getTicketById(
    @CurrentUser('id') userId: string,
    @Param('id') ticketId: string,
  ) {
    return this.helpService.getTicketById(userId, ticketId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('tickets/:id/messages')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add message to ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Message content',
          example: 'Here is the transaction ID: ABC123',
        },
        attachments: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of attachment URLs',
        },
      },
      required: ['message'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Message added successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot add message to closed ticket',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not your ticket',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async addMessage(
    @CurrentUser('id') userId: string,
    @Param('id') ticketId: string,
    @Body() dto: AddMessageDto,
  ) {
    return this.helpService.addMessage(userId, ticketId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tickets/:id/close')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Close a support ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket closed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Ticket is already closed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not your ticket',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async closeTicket(
    @CurrentUser('id') userId: string,
    @Param('id') ticketId: string,
  ) {
    return this.helpService.closeTicket(userId, ticketId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tickets/:id/reopen')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Reopen a closed support ticket' })
  @ApiParam({ name: 'id', description: 'Ticket ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket reopened successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Ticket is not closed',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - valid JWT token required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - not your ticket',
  })
  @ApiResponse({
    status: 404,
    description: 'Ticket not found',
  })
  async reopenTicket(
    @CurrentUser('id') userId: string,
    @Param('id') ticketId: string,
  ) {
    return this.helpService.reopenTicket(userId, ticketId);
  }
}
