const { Brand } = require("../../models/allModels");
const path = require("path");
const fs = require("fs");

async function updatebrand(fastify, options) {
  fastify.register(require("@fastify/multipart"));
  fastify.post(
    "/brand/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const brandId = req.params.id;
        const parts = req.parts();
        let updateFields = {};
        let fileName;

        for await (const part of parts) {
          if (part.type === "field") {
            updateFields.brandName = part.value;
          } else if (part.type === "file") {
            fileName = part.filename;
            const filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            updateFields.brandImage = `public/image/${fileName}`;
          }
        }

        const existingBrand = await Brand.findById(brandId);
        if (!existingBrand) {
          return reply.status(404).send({ error: "Brand not found" });
        }

        Object.assign(existingBrand, updateFields);

        const updatedBrand = await existingBrand.save();

        return reply.send({ brand: updatedBrand });
      } catch (error) {
        console.error("Error updating brand:", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );
}

module.exports = updatebrand;
