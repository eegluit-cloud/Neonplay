# Admin Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8003

# Set port environment variable
ENV PORT=8003

# Start development server
CMD ["npm", "start"]
