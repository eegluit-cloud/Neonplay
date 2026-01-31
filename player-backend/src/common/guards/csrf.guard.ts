import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as crypto from 'crypto';

export const CSRF_SKIP_KEY = 'skipCsrf';

/**
 * Decorator to skip CSRF validation for specific routes
 * Use sparingly - only for public endpoints that don't modify state
 */
export const SkipCsrf = () => {
  return (target: any, key?: string, descriptor?: PropertyDescriptor) => {
    if (descriptor) {
      Reflect.defineMetadata(CSRF_SKIP_KEY, true, descriptor.value);
    } else {
      Reflect.defineMetadata(CSRF_SKIP_KEY, true, target);
    }
    return descriptor || target;
  };
};

/**
 * CSRF Protection Guard
 *
 * Implements Double-Submit Cookie pattern for CSRF protection:
 * 1. Server sets a CSRF token in a cookie (accessible to JS)
 * 2. Client must send the same token in X-CSRF-Token header
 * 3. Server validates that cookie and header values match
 *
 * This works because:
 * - Cookies are automatically sent with requests (same-origin)
 * - Attackers cannot read the cookie value from a different origin
 * - So they cannot set the correct X-CSRF-Token header
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  // Methods that modify state and need CSRF protection
  private readonly protectedMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

  // Cookie name for CSRF token
  static readonly CSRF_COOKIE_NAME = 'XSRF-TOKEN';
  static readonly CSRF_HEADER_NAME = 'x-csrf-token';

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip CSRF check for safe methods (GET, HEAD, OPTIONS)
    if (!this.protectedMethods.includes(request.method)) {
      return true;
    }

    // Check if route is marked to skip CSRF
    const skipCsrf = this.reflector.get<boolean>(
      CSRF_SKIP_KEY,
      context.getHandler(),
    ) || this.reflector.get<boolean>(
      CSRF_SKIP_KEY,
      context.getClass(),
    );

    if (skipCsrf) {
      return true;
    }

    // Get CSRF token from cookie
    const cookieToken = request.cookies?.[CsrfGuard.CSRF_COOKIE_NAME];

    // Get CSRF token from header
    const headerToken = request.headers[CsrfGuard.CSRF_HEADER_NAME] as string;

    // Both must be present
    if (!cookieToken || !headerToken) {
      this.logger.warn(`CSRF validation failed: missing token. Cookie: ${!!cookieToken}, Header: ${!!headerToken}`);
      throw new ForbiddenException('CSRF token validation failed');
    }

    // Tokens must match (constant-time comparison to prevent timing attacks)
    if (!this.safeCompare(cookieToken, headerToken)) {
      this.logger.warn(`CSRF validation failed: token mismatch`);
      throw new ForbiddenException('CSRF token validation failed');
    }

    return true;
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  private safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }

  /**
   * Generate a new CSRF token
   */
  static generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
