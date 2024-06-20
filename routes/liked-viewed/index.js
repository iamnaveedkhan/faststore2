
async function likedViewed(fastify, options) {
    fastify.register(require("./liked")),
    fastify.register(require("./viewed"))
  }
  module.exports = likedViewed;