async function subcategory(fastify, options) {
    fastify.register(require("./getSubcategory")),
    fastify.register(require("./postSubcategory")),
    fastify.register(require("./updateSubcategory"))
  }
module.exports = subcategory;