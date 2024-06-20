const { SubCategory } = require("../../models/allModels");

async function getSubcategory(fastify, options) {
    fastify.get(
        "/sub-categories",
        { onRequest: [fastify.authenticate] },
        async (req, reply) => {
          try {
            const existingData = await SubCategory.find();
    
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
        "/sub-categories/:id",
        { onRequest: [fastify.authenticate] },
        async (req, reply) => {
          try {
            const subcategoryId = req.params.id;
            const existingSubCategory = await SubCategory.findOne({ _id: subcategoryId });
            if (existingSubCategory) {
              reply.send(existingSubCategory);
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

module.exports = getSubcategory;