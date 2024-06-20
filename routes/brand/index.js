async function brands(fastify, options) {
    fastify.register(require("./getBrand.js"));
    fastify.register(require("./postBrand.js"));
    fastify.register(require("./updateBrand.js"));
  }
  module.exports = brands;
  