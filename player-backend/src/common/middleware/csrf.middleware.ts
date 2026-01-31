import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CsrfGuard } from '../guards/csrf.guard';

/**
 * CSRF Middleware
 *
 * Sets the CSRF token cookie on every response.
 * The cookie is accessible to JavaScript (not httpOnly) so the frontend
 * can read it and include it in the X-CSRF-Token header.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Check if CSRF cookie already exists
    let csrfToken = req.cookies?.[CsrfGuard.CSRF_COOKIE_NAME];

    // Generate new token if none exists
    if (!csrfToken) {
      csrfToken = CsrfGuard.generateToken();

      // Set the CSRF cookie
      // - Not httpOnly: so JavaScript can read it
      // - Secure: only sent over HTTPS (in production)
      // - SameSite=Strict: prevents cross-site requests from including the cookie
      res.cookie(CsrfGuard.CSRF_COOKIE_NAME, csrfToken, {
        httpOnly: false, // Must be accessible to JavaScript
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/',
      });
    }

    next();
  }
}
