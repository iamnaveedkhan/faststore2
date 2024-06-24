async function specRoutes(fastify, options) {
  fastify.register(require("./postSpecification")),
  fastify.register(require("./getSpecification"))
}
module.exports = specRoutes;
