async function authenticationRoutes(fastify, options) {
  fastify.register(require("./login"));
  fastify.register(require("./register"));
}
module.exports = authenticationRoutes;
