const { SubCategory } = require("../../models/allModels");
const path = require("path");
const fs = require("fs");

async function postSubcategory(fastify, options) {
  fastify.register(require("@fastify/multipart"));
  fastify.post(
    "/sub-category",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const parts = req.parts();

        let name, category;
        let fileName;

        for await (const part of parts) {
          if (part.type === "file") {
            fileName = part.filename;
            filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
          } else if (part.type === "field") {
            if (part.fieldname === "name") {
              name = part.value;
            } else if (part.fieldname === "category") {
              category = part.value;
            }
          }
        }
        const existingBrand = await SubCategory.findOne({
          subCategoryName: name,
        });
        if (existingBrand) {
          return reply
            .status(409)
            .send({ error: "Category already registered" });
        }

        const subcat = new SubCategory({
          subCategoryName: name,
          category: category,
          subCategoryImage: `public/image/${fileName}`,
        });

        const ProdSaved = await subcat.save();

        return { ProdSaved };
      } catch (error) {
        console.error("Error uploading file:", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );
}

module.exports = postSubcategory;
