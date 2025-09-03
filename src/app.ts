import Fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

import todoRoutes from "./routes/todos";

export async function buildApp() {
  const fastify = Fastify({
    logger: true,
  });

  // Swagger setup
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Awesome Node TS API",
        description: "Todos API with Fastify + Prisma",
        version: "1.0.0",
      },
      components: {
        schemas: {
          Todo: {
            type: "object",
            properties: {
              id: { type: "string", format: "uuid" },
              title: { type: "string" },
              completed: { type: "boolean" },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
          },
        },
      },
    },
  });

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  // Health check route
  fastify.get("/health", async () => {
    return { status: "ok" };
  });

  // Register routes
  await fastify.register(todoRoutes, { prefix: "/todos" });

  return fastify;
}

// Run the server
if (require.main === module) {
  (async () => {
    const app = await buildApp();
    try {
      await app.listen({ port: Number(process.env.PORT) || 3000, host: "0.0.0.0" });
    } catch (err) {
      app.log.error(err);
      process.exit(1);
    }
  })();
}
