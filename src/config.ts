// src/config.ts
export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 100),
  rateLimitWindow: process.env.RATE_LIMIT_WINDOW ?? '1 minute',
}

export const isProd = config.nodeEnv === 'production'
