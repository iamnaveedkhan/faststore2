const { Specification} = require("../../models/allModels");

async function getSpecification(fastify, options) {

  fastify.get(
    "/specifications",
    async (req, reply) => {
      try {
        const existingSpecifications = await Specification.find().populate('category');
        if (existingSpecifications.length > 0) {
          reply.send(existingSpecifications);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/specification/:id",
    // { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const specificationId = req.params.id;
        const existingSpecifications = await Specification.find({
          $or: [{ _id: specificationId }, { category: specificationId }],
        });
        if (existingSpecifications.length > 0) {
          reply.send(existingSpecifications);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );


}

module.exports = getSpecification;
