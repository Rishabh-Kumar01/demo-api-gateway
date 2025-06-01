# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or npm-shrinkwrap.json)
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy the rest of the application source code
COPY . .

# Stage 2: Production stage
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy dependencies from builder stage
COPY --from=builder /usr/src/app/node_modules ./node_modules

# Copy application code from builder stage
COPY --from=builder /usr/src/app/src ./src

# Set environment variables
# PORT will be taken from the .env file or default to 3000 in serverConfig.js
# NODE_ENV is set to production for performance and security
ENV NODE_ENV=production

# Expose the port the app runs on
# The PORT is defined in your .env file as 3000
EXPOSE 3000

# Add a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Command to run the application
CMD ["node", "src/server.js"]