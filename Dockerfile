# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy root configs and package.json files
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/

# Install only backend workspace dependencies
RUN npm install --workspace=@dtc/backend --include-workspace-root --legacy-peer-deps

# Copy source code
COPY apps/backend ./apps/backend
COPY eslint.config.ts turbo.json ./

# Set env flag to skip admin dashboard build during container compilation
ENV DISABLE_MEDUSA_ADMIN=true

# Build the backend package
RUN npm run build --workspace=@dtc/backend

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9000

# Copy node_modules and built code
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend ./apps/backend

EXPOSE 9000

# Run Medusa backend start
CMD ["npm", "run", "start", "--workspace=@dtc/backend"]
