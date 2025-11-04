# Client Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files (if they exist)
COPY package*.json yarn.lock* ./

# Install dependencies if package.json exists
RUN if [ -f package.json ]; then yarn install; fi

# Copy source code
COPY . .

# Expose port for Vite dev server
EXPOSE 5173

# Start the development server
CMD ["yarn", "dev", "--host", "0.0.0.0"]
