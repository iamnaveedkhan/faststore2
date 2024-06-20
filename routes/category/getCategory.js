const { Category } = require("../../models/allModels");

async function category(fastify, options) {
  fastify.get(
    "/categories",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const existingData = await Category.find();

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
    "/category/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const categoryId = req.params.id;
        const existingCategory = await Category.findOne({ _id: categoryId });
        if (existingCategory) {
          reply.send(existingCategory);
        } else {
          reply.code(404).send({ error: "User not found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
}

module.exports = category;
