const { Brand } = require("../../models/allModels");

async function getbrand(fastify, options) {
fastify.get(
  "/brands",
  { onRequest: [fastify.authenticate] },
  async (req, reply) => {
    try {
      const existingData = await Brand.find();

      if (existingData.length > 0) {
        reply.send(existingData);
      } else {
        reply.code(404).send({ error: "No data found" });
      }
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: "Internal server error" });
    }
  }
);

fastify.get(
  "/brand/:id",
  { onRequest: [fastify.authenticate] },
  async (req, reply) => {
    try {
      const brandId = req.params.id;
      const existingBrand = await Brand.findOne({ _id: brandId });
      if (existingBrand) {
        reply.send(existingBrand);
      } else {
        reply.code(404).send({ error: "Brand not found" });
      }
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: "Internal server error" });
    }
  }
);
}

module.exports = getbrand;