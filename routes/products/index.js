

async function productsRoutes(fastify, options) {
    fastify.register(require("./upload")),
    fastify.register(require("./all_lead"))
  }
  module.exports = productsRoutes;