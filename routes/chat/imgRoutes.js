const path = require("path");
const fs = require("fs");

async function Uploadimg(fastify, options) {
    fastify.register(require("@fastify/multipart"));
    fastify.post(
      "/uploadimg",
      { onRequest: [fastify.authenticate] },
      async (req, reply) => {
        try {
            console.log('in uploadimg');
            const parts = req.parts();
            let fileName;
        
            for await (const part of parts) {
              if (part.type === "file") {
                fileName = part.filename;
                filePath = path.join("public/image/", fileName);
                const writableStream = fs.createWriteStream(filePath);
                await part.file.pipe(writableStream);
              }else{
                
              }
            }
            return `public/image/${fileName}`;   
        } catch (error) {
          console.error("Error uploading file:", error);
          return reply.status(500).send("Internal Server Error");
        }
      }
    );

}

module.exports = Uploadimg;