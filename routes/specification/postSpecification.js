const { Specification} = require("../../models/allModels");

async function addSpecification(fastify, options) {
  fastify.register(require("@fastify/multipart"));
  fastify.post("/add-specifications", async (request, reply) => {
    try {
      const mainKeys = Array.isArray(request.body.mainKey)
        ? request.body.mainKey
        : [request.body.mainKey];
      const { name, category } = request.body;

      console.log(request.body);
      const specifications = {};

      for (let i = 0; i < mainKeys.length; i++) {
        const keyNames = Array.isArray(request.body[`mainKey[${i}][keyName][]`])
          ? request.body[`mainKey[${i}][keyName][]`]
          : [request.body[`mainKey[${i}][keyName][]`]];
        const keyTypes = Array.isArray(request.body[`mainKey[${i}][keyType][]`])
          ? request.body[`mainKey[${i}][keyType][]`]
          : [request.body[`mainKey[${i}][keyType][]`]];
        const isFilters = Array.isArray(
          request.body[`mainKey[${i}][isFilter][]`]
        )
          ? request.body[`mainKey[${i}][isFilter][]`]
          : [request.body[`mainKey[${i}][isFilter][]`]];
        const isMandatories = Array.isArray(
          request.body[`mainKey[${i}][isMandatory][]`]
        )
          ? request.body[`mainKey[${i}][isMandatory][]`]
          : [request.body[`mainKey[${i}][isMandatory][]`]];
        const isVariants = Array.isArray(
          request.body[`mainKey[${i}][isVariant][]`]
        )
          ? request.body[`mainKey[${i}][isVariant][]`]
          : [request.body[`mainKey[${i}][isVariant][]`]];
          const isHighlight = Array.isArray(
            request.body[`mainKey[${i}][isHighlight][]`]
          )
            ? request.body[`mainKey[${i}][isHighlight][]`]
            : [request.body[`mainKey[${i}][isHighlight][]`]];
        const enumOptions = Array.isArray(
          request.body[`mainKey[${i}][enumOptions][]`]
        )
          ? request.body[`mainKey[${i}][enumOptions][]`]
          : [request.body[`mainKey[${i}][enumOptions][]`]]; 

    
        const keys = {};

   
        for (let j = 0; j < keyNames.length; j++) {
          const type = keyTypes[j];
          let options = null;

          if (type === "enum") {
            options = enumOptions[j].split(",").map((option) => option.trim());
          }


          const keyName = keyNames[j];
          keys[keyName] = {
            type: type,
            options: options, 
            isFilter: isFilters[j] ? isFilters[j] : false,
            isMandatory: isMandatories[j] ? isMandatories[j] : false,
            isVariant: isVariants[j] ? isVariants[j] : false,
            isHighlight: isHighlight[j] ? isHighlight[j] : false,
          };
        }

        const mainKeyName = mainKeys[i];
        specifications[mainKeyName] = keys;
      }

      const spec = new Specification({
        name: name,
        category: category,
        specification: specifications,
      });

      const savedSpec = await spec.save();

      reply.code(201).send(savedSpec);
    } catch (error) {
      console.error("Error saving specifications:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.post("/update-specifications/:Id", async (req, reply) => {
    try {
        const {Id} = req.params;
        const {specificationName} = req.body;
       
        const data = await Specification.findById(Id);
        data.name = specificationName;
        const updatedData = await data.save();

        console.log(updatedData);
        return data;
    } catch (error) {
      console.error("Error updating specifications:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });
  
}

module.exports = addSpecification;
