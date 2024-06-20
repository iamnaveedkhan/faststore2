async function user(fastify, options) {
    fastify.register(require("./getUser")),
    fastify.register(require("./updateUser"))

  }
module.exports = user;