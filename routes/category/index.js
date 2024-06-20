async function category(fastify, options) {
  fastify.register(require("./getCategory.js"));
  fastify.register(require("./postCategory.js"));
  fastify.register(require("./updateCategory.js"));
}
module.exports = category;
