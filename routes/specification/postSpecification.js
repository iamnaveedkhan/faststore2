const { Specification} = require("../../models/allModels");

async function addSpecification(fastify, options) {
  fastify.register(require("@fastify/multipart"));
  fastify.post("/add-specifications", async (request, reply) => {
    try {
      const mainKeys = Array.isArray(request.body.mainKey)
        ? request.body.mainKey
        : [request.body.mainKey];
      const { name, category } = request.body;

      // Create an array to store specifications
      console.log(request.body);
      const specifications = {};

      // Loop through each main key
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
          : [request.body[`mainKey[${i}][enumOptions][]`]]; // Added this line

        // Create an array to store keys
        const keys = {};

        // Loop through each key name
        for (let j = 0; j < keyNames.length; j++) {
          const type = keyTypes[j];
          let options = null; // Initialize options

          // If the type is 'enum', split the enumOptions by comma and store in an array
          if (type === "enum") {
            options = enumOptions[j].split(",").map((option) => option.trim());
          }

          // Add each key and its attributes to the keys object
          const keyName = keyNames[j];
          keys[keyName] = {
            type: type,
            options: options, // Add options field
            isFilter: isFilters[j] ? isFilters[j] : false,
            isMandatory: isMandatories[j] ? isMandatories[j] : false,
            isVariant: isVariants[j] ? isVariants[j] : false,
            isHighlight: isHighlight[j] ? isHighlight[j] : false,
          };
        }

        // Add the keys object to the specifications object under the main key
        const mainKeyName = mainKeys[i];
        specifications[mainKeyName] = keys;
      }

      // Create a new Specification document
      const spec = new Specification({
        name: name,
        category: category,
        specification: specifications,
      });

      // Save the document to the database
      const savedSpec = await spec.save();

      // Send response
      reply.code(201).send(savedSpec);
    } catch (error) {
      console.error("Error saving specifications:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });
}

module.exports = addSpecification;
