async function modelRoutes(fastify, options) {
    fastify.register(require("./postModel"))
  }
module.exports = modelRoutes;