const { Category } = require("../../models/allModels");
const path = require("path");
const fs = require("fs");

async function category(fastify, options) {
  fastify.register(require("@fastify/multipart"));
  fastify.post(
    "/category",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const parts = req.parts();
        let name;
        let fileName;

        for await (const part of parts) {
          if (part.type === "file") {
            fileName = part.filename;
            filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            hasFileField = true;
          } else if (part.type === "field") {
            if (part.fieldname === "name") {
              name = part.value;
            }
          }
        }

        // if (name == undefined || name == "" || fileName == undefined) {
        //   return reply
        //     .status(400)
        //     .send({ error: "Name and file fields are required" });
        // }

        const existingBrand = await Category.findOne({ categoryName: name });
        if (existingBrand) {
          return reply
            .status(409)
            .send({ error: "Category already registered" });
        }
        const category = new Category({
          categoryName: name,
          categoryImage: `public/image/${fileName}`,
        });
        const BrandSaved = await category.save();
        return { BrandSaved};
      } catch (error) {
        console.error("Error uploading file:", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );
}

module.exports = category;
