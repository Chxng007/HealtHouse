const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/prisma');

const server = app.listen(env.PORT, () => {
  console.log(`HealthCore API escuchando en http://localhost:${env.PORT}`);
});

async function shutdown() {
  console.log('\nCerrando servidor...');
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
