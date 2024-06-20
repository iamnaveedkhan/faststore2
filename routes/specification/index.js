async function specRoutes(fastify, options) {
  fastify.register(require("./postSpecification"))
}
module.exports = specRoutes;
