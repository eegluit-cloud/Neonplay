import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { RedisService } from '../../database/redis/redis.service';
import {
  createPaginatedResult,
  getPaginationParams,
  PaginationDto,
} from '../../common/utils/pagination.util';

export interface FaqQueryDto extends PaginationDto {
  category?: string;
  search?: string;
}

export interface FaqDto {
  id: string;
  question: string;
  answer: string;
  isFeatured: boolean;
  viewCount: number;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FaqCategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  faqCount: number;
}

export interface CreateTicketDto {
  subject: string;
  message: string;
  category: string;
  priority?: 'low' | 'medium' | 'high';
  attachments?: string[];
}

export interface TicketDto {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date | null;
  messageCount: number;
}

export interface TicketDetailDto extends TicketDto {
  messages: TicketMessageDto[];
}

export interface TicketMessageDto {
  id: string;
  message: string;
  attachments: any;
  senderType: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface AddMessageDto {
  message: string;
  attachments?: string[];
}

@Injectable()
export class HelpService {
  private readonly logger = new Logger(HelpService.name);

  // Cache keys and TTLs
  private readonly CACHE_PREFIX = 'help';
  private readonly FAQS_KEY = `${this.CACHE_PREFIX}:faqs`;
  private readonly FEATURED_FAQS_KEY = `${this.CACHE_PREFIX}:faqs:featured`;
  private readonly CATEGORIES_KEY = `${this.CACHE_PREFIX}:categories`;
  private readonly FAQ_CACHE_TTL = 600; // 10 minutes
  private readonly CATEGORIES_CACHE_TTL = 600; // 10 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Get paginated FAQs with filtering
   */
  async getFaqs(query: FaqQueryDto) {
    const { skip, take } = getPaginationParams(query);

    const where: any = {
      isActive: true,
    };

    // Filter by category slug
    if (query.category) {
      where.category = { slug: query.category };
    }

    // Search in question/answer
    if (query.search) {
      where.OR = [
        { question: { contains: query.search, mode: 'insensitive' } },
        { answer: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [faqs, total] = await Promise.all([
      this.prisma.faq.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          question: true,
          answer: true,
          isFeatured: true,
          viewCount: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      this.prisma.faq.count({ where }),
    ]);

    return createPaginatedResult(faqs, total, query.page || 1, query.limit || 20);
  }

  /**
   * Get featured FAQs for homepage/help section
   */
  async getFeaturedFaqs(): Promise<FaqDto[]> {
    // Try cache first
    const cached = await this.redis.get<FaqDto[]>(this.FEATURED_FAQS_KEY);
    if (cached) {
      return cached;
    }

    const faqs = await this.prisma.faq.findMany({
      where: {
        isActive: true,
        isFeatured: true,
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 10,
      select: {
        id: true,
        question: true,
        answer: true,
        isFeatured: true,
        viewCount: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Cache the result
    await this.redis.set(this.FEATURED_FAQS_KEY, faqs, this.FAQ_CACHE_TTL);

    return faqs as unknown as FaqDto[];
  }

  /**
   * Search FAQs
   */
  async searchFaqs(query: string) {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }

    const faqs = await this.prisma.faq.findMany({
      where: {
        isActive: true,
        OR: [
          { question: { contains: query, mode: 'insensitive' } },
          { answer: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
      take: 20,
      select: {
        id: true,
        question: true,
        answer: true,
        isFeatured: true,
        viewCount: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return faqs;
  }

  /**
   * Get FAQ by ID
   */
  async getFaqById(id: string): Promise<FaqDto> {
    const cacheKey = `${this.CACHE_PREFIX}:faq:${id}`;

    // Try cache first
    const cached = await this.redis.get<FaqDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const faq = await this.prisma.faq.findUnique({
      where: { id },
      select: {
        id: true,
        question: true,
        answer: true,
        isFeatured: true,
        viewCount: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!faq || !faq.isActive) {
      throw new NotFoundException('FAQ not found');
    }

    // Cache the result
    await this.redis.set(cacheKey, faq, this.FAQ_CACHE_TTL);

    return faq as unknown as FaqDto;
  }

  /**
   * Get FAQ categories
   */
  async getCategories(): Promise<FaqCategoryDto[]> {
    // Try cache first
    const cached = await this.redis.get<FaqCategoryDto[]>(this.CATEGORIES_KEY);
    if (cached) {
      return cached;
    }

    const categories = await this.prisma.faqCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        _count: {
          select: {
            faqs: {
              where: { isActive: true },
            },
          },
        },
      },
    });

    const result: FaqCategoryDto[] = categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      faqCount: category._count.faqs,
    }));

    // Cache the result
    await this.redis.set(this.CATEGORIES_KEY, result, this.CATEGORIES_CACHE_TTL);

    return result;
  }

  /**
   * Create a support ticket
   */
  async createTicket(userId: string, data: CreateTicketDto): Promise<TicketDto> {
    // Generate ticket number
    const ticketCount = await this.prisma.supportTicket.count();
    const ticketNumber = `TKT-${String(ticketCount + 1).padStart(6, '0')}`;

    // Create ticket
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        ticketNumber,
        subject: data.subject,
        message: data.message,
        category: data.category,
        priority: data.priority || 'medium',
        status: 'open',
      },
    });

    // Create initial message
    await this.prisma.supportMessage.create({
      data: {
        ticketId: ticket.id,
        senderId: userId,
        senderType: 'user',
        message: data.message,
        attachments: data.attachments || [],
      },
    });

    // Get message count
    const messageCount = await this.prisma.supportMessage.count({
      where: { ticketId: ticket.id },
    });

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      lastMessageAt: ticket.createdAt,
      messageCount,
    };
  }

  /**
   * Get user's support tickets
   */
  async getUserTickets(userId: string, query?: PaginationDto) {
    const { skip, take } = getPaginationParams(query || {});

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        skip,
        take,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { createdAt: true },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      this.prisma.supportTicket.count({ where: { userId } }),
    ]);

    const items: TicketDto[] = tickets.map((ticket) => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      lastMessageAt: ticket.messages[0]?.createdAt || null,
      messageCount: ticket._count.messages,
    }));

    return createPaginatedResult(items, total, query?.page || 1, query?.limit || 20);
  }

  /**
   * Get ticket by ID (with messages)
   */
  async getTicketById(userId: string, ticketId: string): Promise<TicketDetailDto> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            message: true,
            attachments: true,
            senderType: true,
            isInternal: true,
            createdAt: true,
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    // Verify ownership
    if (ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    // Filter out internal messages for users
    const visibleMessages = ticket.messages.filter((m) => !m.isInternal);

    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      lastMessageAt: visibleMessages[visibleMessages.length - 1]?.createdAt || null,
      messageCount: ticket._count.messages,
      messages: visibleMessages,
    };
  }

  /**
   * Add message to ticket
   */
  async addMessage(
    userId: string,
    ticketId: string,
    data: AddMessageDto,
  ): Promise<TicketMessageDto> {
    // Get ticket and verify ownership
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      throw new BadRequestException('Cannot add message to closed ticket');
    }

    // Create message
    const message = await this.prisma.supportMessage.create({
      data: {
        ticketId,
        senderId: userId,
        senderType: 'user',
        message: data.message,
        attachments: data.attachments || [],
      },
      select: {
        id: true,
        message: true,
        attachments: true,
        senderType: true,
        isInternal: true,
        createdAt: true,
      },
    });

    // Update ticket timestamp and reopen if it was waiting for user response
    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: ticket.status === 'awaiting_user' ? 'open' : ticket.status,
      },
    });

    return message;
  }

  /**
   * Close a ticket
   */
  async closeTicket(userId: string, ticketId: string): Promise<{ success: boolean }> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    if (ticket.status === 'closed' || ticket.status === 'resolved') {
      throw new BadRequestException('Ticket is already closed');
    }

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'closed',
        resolvedAt: new Date(),
      },
    });

    return { success: true };
  }

  /**
   * Reopen a closed ticket
   */
  async reopenTicket(userId: string, ticketId: string): Promise<{ success: boolean }> {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.userId !== userId) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
      throw new BadRequestException('Ticket is not closed');
    }

    await this.prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: 'open',
        resolvedAt: null,
      },
    });

    return { success: true };
  }

  /**
   * Invalidate FAQ caches (admin use)
   */
  async invalidateFaqCaches(): Promise<void> {
    await Promise.all([
      this.redis.del(this.FAQS_KEY),
      this.redis.del(this.FEATURED_FAQS_KEY),
      this.redis.del(this.CATEGORIES_KEY),
    ]);
    this.logger.log('FAQ caches invalidated');
  }
}
