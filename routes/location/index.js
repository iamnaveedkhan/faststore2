
async function location(fastify, options) {
    fastify.register(require("./location"))
  }
  module.exports = location;