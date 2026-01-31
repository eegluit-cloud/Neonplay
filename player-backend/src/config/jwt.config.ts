import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  // Access token settings
  access: {
    secret: process.env.JWT_ACCESS_SECRET || 'your-access-secret-min-32-chars',
    expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m',
    algorithm: 'HS256' as const,
  },

  // Refresh token settings
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-min-32-chars',
    expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
    algorithm: 'HS256' as const,
  },

  // Token issuer and audience
  issuer: process.env.JWT_ISSUER || 'wbc2026',
  audience: process.env.JWT_AUDIENCE || 'wbc2026-api',

  // Cookie settings (for refresh token)
  cookie: {
    name: 'refreshToken',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/auth/refresh',
  },

  // Session settings
  session: {
    maxConcurrentSessions: parseInt(
      process.env.JWT_MAX_CONCURRENT_SESSIONS || '5',
      10,
    ),
    revokeOldestOnMax: true,
  },

  // Admin JWT settings (separate from user tokens)
  admin: {
    secret: process.env.JWT_ADMIN_SECRET || 'your-admin-secret-min-32-chars',
    expiresIn: process.env.JWT_ADMIN_EXPIRY || '8h',
  },
}));
