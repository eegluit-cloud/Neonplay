# VIP Icon Upload - S3 Setup

## Installation

To enable VIP icon uploads to S3, install the AWS SDK:

```bash
npm install @aws-sdk/client-s3
```

## Configuration

Add the following environment variables to your `.env` file:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=us-east-1
```

## Usage

1. **If S3 is configured**: Uploaded icons will be stored in S3 at `s3://your-bucket/vip-icons/`
2. **If S3 is NOT configured**: Default icon (`/icons/vip/default.png`) will be used

## Notes

- Maximum file size: 5MB
- Supported formats: All image types (png, jpg, jpeg, gif, svg, etc.)
- Files are uploaded with public-read ACL
- If upload fails, the system automatically falls back to the default icon
