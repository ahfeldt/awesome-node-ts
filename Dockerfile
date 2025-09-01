# -------- Build stage --------
FROM node:22-alpine AS build
WORKDIR /app

# pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Installera alla deps (inkl dev) baserat på lockfil
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Kopiera källkod och bygg
COPY . .
# Ingen prisma generate här – onödigt och gör kopieringen knepig
RUN pnpm build

# -------- Runtime stage --------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Installera endast prod-deps (detta triggar @prisma/client postinstall => prisma generate)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Kopiera byggd kod och prisma-schemat
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/server.js"]
