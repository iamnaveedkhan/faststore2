async function Dashboard(fastify, options) {
  fastify.register(require("./getDashboardData.js"));
}
module.exports = Dashboard;
