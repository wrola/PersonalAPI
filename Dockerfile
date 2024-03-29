FROM node:20.11.0 AS builder
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.build.json ./
COPY tsconfig.json ./
RUN npm ci
COPY src ./
RUN npm run build

FROM node

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
