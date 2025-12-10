FROM node:22-slim AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Development stage
FROM node:22-slim AS development

WORKDIR /app

# Install bash for wait-for-it script
RUN apt-get update && apt-get install -y --no-install-recommends bash && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm install

# Download wait-for-it script to ensure PostgreSQL is ready before starting the app
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Copy source code
COPY . .

# Copy entry point script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=development
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

# Start the dev server
CMD ["npm", "run", "dev"]

# Production stage
FROM node:22-slim

WORKDIR /app

# Install bash for wait-for-it script
RUN apt-get update && apt-get install -y --no-install-recommends bash && rm -rf /var/lib/apt/lists/*

# Copy package files and lock file from build stage to ensure consistency
COPY --from=build /app/package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Download wait-for-it script to ensure PostgreSQL is ready before starting the app
ADD https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh /wait-for-it.sh
RUN chmod +x /wait-for-it.sh

# Copy built files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/drizzle.config.ts ./drizzle.config.ts

# Copy entry point script
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose the port
EXPOSE 5000

# Set entrypoint
ENTRYPOINT ["/docker-entrypoint.sh"]

# Start the server
CMD ["node", "server/index.js"]