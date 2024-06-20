// routes/index.js
const chatRoutes = require('./chatRoutes');
const imgRoutes = require('./imgRoutes');

async function routes(fastify, options) {
  fastify.register(chatRoutes);
  fastify.register(imgRoutes);
}

module.exports = routes;