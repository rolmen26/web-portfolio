# Development Dockerfile for React Portfolio
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Enable the package manager pinned in package.json
RUN corepack enable

# Install dependencies for the image layer; compose startup will sync again if package files change.
RUN pnpm install --frozen-lockfile

# Copy project files
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Start development server
CMD ["pnpm", "dev", "--", "--host", "0.0.0.0"]
