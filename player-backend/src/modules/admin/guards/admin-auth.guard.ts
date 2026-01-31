import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../../../database/prisma/prisma.service';

export interface AdminJwtPayload {
  sub: string;
  email: string;
  role: string;
  type: 'admin';
}

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly logger = new Logger(AdminAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Admin authentication required');
    }

    try {
      // Verify the token with the admin secret
      const payload = await this.jwtService.verifyAsync<AdminJwtPayload>(token, {
        secret: this.configService.get<string>('jwt.adminSecret') ||
          this.configService.get<string>('jwt.accessSecret'),
      });

      // Verify this is an admin token
      if (payload.type !== 'admin') {
        throw new UnauthorizedException('Invalid admin token');
      }

      // Fetch admin user and verify they still exist and are active
      const admin = await this.prisma.adminUser.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          permissions: true,
          isActive: true,
        },
      });

      if (!admin) {
        throw new UnauthorizedException('Admin user not found');
      }

      if (!admin.isActive) {
        throw new UnauthorizedException('Admin account is deactivated');
      }

      // Attach admin to request
      (request as any).admin = admin;

      return true;
    } catch (error: any) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.warn(`Admin authentication failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired admin token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
