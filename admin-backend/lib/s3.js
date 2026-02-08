const path = require('path');
const crypto = require('crypto');

// S3 configuration - will use AWS SDK v3 when credentials are available
let s3Client = null;
let PutObjectCommand = null;

// Try to load AWS SDK if available
try {
  const { S3Client } = require('@aws-sdk/client-s3');
  const { PutObjectCommand: PutCommand } = require('@aws-sdk/client-s3');

  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
  const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
  const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;

  if (AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_S3_BUCKET) {
    s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
    PutObjectCommand = PutCommand;
    console.log('✅ S3 client initialized successfully');
  } else {
    console.warn('⚠️  S3 credentials not configured. File uploads will use default image.');
  }
} catch (error) {
  console.warn('⚠️  AWS SDK not installed. File uploads will use default image.');
  console.warn('   Run: npm install @aws-sdk/client-s3');
}

const DEFAULT_VIP_ICON = '/icons/vip/default.png';

/**
 * Upload a file to S3 under a given folder prefix.
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original file name
 * @param {string} mimetype - File mimetype
 * @param {string} folder - S3 key prefix (e.g. 'promotions', 'vip-icons')
 * @returns {Promise<string|null>} - Full S3 URL on success, null if S3 not configured
 */
const uploadFile = async (fileBuffer, originalName, mimetype, folder = 'uploads') => {
  if (!s3Client || !PutObjectCommand) {
    return null;
  }

  const fileExt = path.extname(originalName);
  const fileName = `${folder}/${crypto.randomUUID()}${fileExt}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${fileName}`;
  console.log('✅ File uploaded to S3:', s3Url);
  return s3Url;
};

/**
 * Upload a VIP icon to S3 (legacy wrapper).
 * Falls back to DEFAULT_VIP_ICON if S3 is not configured or upload fails.
 */
const uploadToS3 = async (fileBuffer, originalName, mimetype) => {
  try {
    const url = await uploadFile(fileBuffer, originalName, mimetype, 'vip-icons');
    return url || DEFAULT_VIP_ICON;
  } catch (error) {
    console.error('❌ Failed to upload to S3:', error.message);
    return DEFAULT_VIP_ICON;
  }
};

module.exports = {
  uploadFile,
  uploadToS3,
  DEFAULT_VIP_ICON,
  isS3Configured: () => !!s3Client,
};
