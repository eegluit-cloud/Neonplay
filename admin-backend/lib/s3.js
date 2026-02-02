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
 * Upload a file to S3
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original file name
 * @param {string} mimetype - File mimetype
 * @returns {Promise<string>} - Uploaded file URL or default image path
 */
const uploadToS3 = async (fileBuffer, originalName, mimetype) => {
  // If S3 is not configured, return default image
  if (!s3Client || !PutObjectCommand) {
    console.log('S3 not configured, using default icon');
    return DEFAULT_VIP_ICON;
  }

  try {
    const fileExt = path.extname(originalName);
    const fileName = `vip-icons/${crypto.randomUUID()}${fileExt}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: fileName,
      Body: fileBuffer,
      ContentType: mimetype,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    // Construct the S3 URL
    const s3Url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;

    console.log('✅ File uploaded to S3:', s3Url);
    return s3Url;
  } catch (error) {
    console.error('❌ Failed to upload to S3:', error.message);
    return DEFAULT_VIP_ICON;
  }
};

module.exports = {
  uploadToS3,
  DEFAULT_VIP_ICON,
  isS3Configured: () => !!s3Client,
};
