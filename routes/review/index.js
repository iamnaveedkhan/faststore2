async function review(fastify, options) {
    fastify.register(require("./postReview.js"));
    fastify.register(require("./getReview.js"));
  }
  module.exports = review;
  