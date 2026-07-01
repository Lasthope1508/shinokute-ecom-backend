# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy root configs and package.json files
COPY package.json package-lock.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

# Install all dependencies
RUN npm install --legacy-peer-deps

# Copy source code of the storefront
COPY apps/storefront ./apps/storefront
COPY eslint.config.ts turbo.json ./

# Build the storefront package
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_DEFAULT_REGION
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_MAP

ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL
ENV NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION
ENV NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_MAP=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY_MAP

RUN npm run build --workspace=@dtc/storefront

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Copy node_modules and built code
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/storefront ./apps/storefront

EXPOSE 8000

# Command to run Next.js storefront start
CMD ["npm", "run", "start", "--workspace=@dtc/storefront"]
