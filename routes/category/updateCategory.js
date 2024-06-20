const { Category } = require("../../models/allModels");
const path = require("path");
const fs = require("fs");

async function updateCategory(fastify, options) {
  fastify.register(require("@fastify/multipart"));
fastify.post('/category/:id', { onRequest: [fastify.authenticate] }, async (req, reply) => {
    try {
        const categoryId = req.params.id;
        const parts = req.parts();
        let name;
        let fileName;
        let filePath;
        for await (const part of parts) { 
            if (part.type === 'field') {
                name = part.value.trim();
            } else if (part.type === 'file') {
                if (part.filename) {
                    fileName = part.filename;
                    filePath = path.join('public/image/', fileName);
                    const writableStream = fs.createWriteStream(filePath);
                    await part.file.pipe(writableStream);
                } else {
                    console.log("No file sent");
                }
            } 
        }
        
        const existingCategory = await Category.findById(categoryId);
        if (!existingCategory) {
            return reply.status(404).send({ error: " Sub Category not found !" });
        }

        if (name != '' && existingCategory.categoryName != name && name!=undefined) {
            existingCategory.categoryName = name;
        }
        else{

        }
         
        if(fileName!=undefined || fileName!= null){
            existingCategory.categoryImage = `public/image/${fileName}`;
        }

        const updatedCategory = await existingCategory.save();

        return reply.send({ updatedCategroy: updatedCategory });
    } catch (error) {
        console.error('Error updating cateogy:', error);
        return reply.status(500).send('Internal Server Error');
    }
});
}

module.exports = updateCategory;