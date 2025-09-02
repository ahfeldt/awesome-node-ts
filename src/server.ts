import { buildApp } from './app.js';

const app = buildApp();

const port = Number(process.env.PORT ?? 3000);
const host = '0.0.0.0';

app
  .listen({ port, host })
  .then(() => {
    console.log(`Server running at http://${host}:${port}`);
  })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  });
