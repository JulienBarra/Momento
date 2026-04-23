FROM node:20-alpine AS base
WORKDIR /app

FROM base AS dependencies
COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
COPY . .
RUN node ace build

FROM base AS production
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3333

COPY --from=build /app/build ./
RUN npm ci --omit=dev

EXPOSE 3333
CMD ["sh", "-c", "node ace migration:run --force && node bin/server.js"]
