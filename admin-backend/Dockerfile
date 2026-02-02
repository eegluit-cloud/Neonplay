# Admin Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Install OpenSSL dependencies for Prisma
RUN apk add --no-cache openssl

# Copy shared schema first
COPY shared ./shared/

# Copy package files
COPY admin-backend/package*.json ./

# Copy prisma seed file
COPY admin-backend/prisma ./prisma/

# Install dependencies
RUN npm install

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY admin-backend .

# Expose port
EXPOSE 8002

# Start server
CMD ["npm", "run", "dev"]
