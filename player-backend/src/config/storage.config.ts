import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  // S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    bucket: process.env.S3_BUCKET || 'wbc2026',
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: process.env.S3_REGION || 'us-east-1',

    // Use path-style URLs (required for some S3-compatible services)
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',

    // CDN URL for public assets
    cdnUrl: process.env.S3_CDN_URL,

    // Signed URL expiration (in seconds)
    signedUrlExpiry: parseInt(process.env.S3_SIGNED_URL_EXPIRY || '3600', 10),
  },

  // Upload settings
  upload: {
    // Maximum file size (in bytes)
    maxFileSize: parseInt(process.env.UPLOAD_MAX_FILE_SIZE || '10485760', 10), // 10MB

    // Allowed MIME types for different upload categories
    allowedMimeTypes: {
      avatar: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'image/jpeg', 'image/png'],
      video: ['video/mp4', 'video/webm', 'video/quicktime'],
    },

    // Image processing
    avatar: {
      maxWidth: 500,
      maxHeight: 500,
      quality: 85,
    },

    // Upload paths
    paths: {
      avatars: 'avatars',
      documents: 'documents',
      gameAssets: 'games',
      banners: 'banners',
      prizes: 'prizes',
      content: 'content',
    },
  },

  // Local storage fallback (for development)
  local: {
    enabled: process.env.STORAGE_LOCAL === 'true',
    path: process.env.STORAGE_LOCAL_PATH || './uploads',
    publicUrl: process.env.STORAGE_LOCAL_URL || '/uploads',
  },
}));
