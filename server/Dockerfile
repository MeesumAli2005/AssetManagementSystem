# Stage 1: install everything and compile the TypeScript into dist/
FROM node:22.21.1 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: a clean image that only holds the compiled output and the
# dependencies actually needed to run it, not the compiler itself.
FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

# uploads/ is where multer writes files at runtime (see src/middleware/upload.ts) —
# created here so the named volume mounted over it picks up node's ownership
# instead of root's.
RUN mkdir -p uploads && chown -R node:node /app
USER node

EXPOSE 5000
CMD ["node", "dist/server.js"]
