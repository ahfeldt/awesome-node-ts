# -------- Build stage --------
FROM node:22-alpine AS build
WORKDIR /app

# pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Installera alla deps (inkl dev)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Kopiera källkod och generera Prisma Client (för typer till tsc)
COPY . .
RUN npx prisma generate

# Bygg TS -> dist/
RUN pnpm build

# -------- Runtime stage --------
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

# pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# *** Viktigt: kopiera prisma före install så postinstall hittar schema ***
COPY --from=build /app/prisma ./prisma

# Installera endast prod-deps (triggar @prisma/client postinstall => prisma generate)
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile

# Livrem: kör generate igen (snabbt, idempotent)
RUN npx prisma generate

# Kopiera byggd kod
COPY --from=build /app/dist ./dist

ENV PORT=3000
EXPOSE 3000

CMD ["node", "dist/server.js"]
