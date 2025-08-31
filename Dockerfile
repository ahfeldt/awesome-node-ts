# 1) Build stage
FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Installera deps (fulla – inkl dev)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Kopiera källkod
COPY . .

# 👇 VIKTIGT: generera Prisma Client (krävs för typegen)
RUN npx prisma generate

# Bygg TS -> dist
RUN pnpm build

# 2) Runtime stage (oförändrat)
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=build /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=build /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/server.js"]
