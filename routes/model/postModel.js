const { Model2, Properties, Specification2, Photo, Variants } = require("../../models/allModels");
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

async function addSpecification(fastify, options) {
  fastify.register(require("@fastify/multipart"));

  fastify.post(
    "/add-model",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const data = {};
        let colorCode;
        let photos = [];
        let fileName;
        let spec = {};
        let spec2 = {};
        let proper = {};
        let type;
        let filter = {};
        let variantFields = {}; 
        let productName;
        let thumbnail;
        let productLink;
        thumbnail = `public/image/`

        const parts = req.parts();

        for await (const part of parts) {
          if (part.type === "file") {
            fileName = part.filename;
            const filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            if(part.fieldname === "thumbnail"){
              thumbnail = `public/image/${fileName}`
            }else{
              photos.push(`public/image/${fileName}`);
            }
          } else {
            if (part.fieldname.startsWith("specification.")) {
              spec[part.fieldname] = part.value;
            } else if (part.fieldname.startsWith("properties.")) {
              const key = part.fieldname.split("properties.")[1];
              proper[key] = part.value;
            } else if (part.fieldname == "type") {
              type = part.value;
            } else if (part.fieldname == "productName") {
              productName = part.value;
            }else if (part.fieldname == "colorCode") {
              colorCode = part.value;
            }else if (part.fieldname == "productLink") {
              productLink = part.value;
            } else {
              data[part.fieldname] = part.value;
            }
          }
        }
        
        const photoModel = new Photo({ photoList: photos });
        await photoModel.save();

        const propertiesModel = new Properties(proper);
        await propertiesModel.save();
        
        const specificationModel = new Specification2(spec);
        await specificationModel.save();
        
        for await (const [key, value] of Object.entries(specificationModel.specification)) {
          spec2[key] = {};
          for (const [key1, value1] of Object.entries(value)){
            
            if (value1['isVariant'] === 'true' && value1['title'] !== '' && value1['title'] !== 'No') {
              variantFields[key1] = value1['title'];
              spec2[key][key1] = value1['title'];
              filter[key1] = [value1['title']];
            } else if (value1['isFilter'] === 'true' && value1['isVariant'] === 'false' && value1['title'] !== '' && value1['title'] !== 'No') {
              spec2[key][key1] = value1['title'];
              filter[key1] = [value1['title']];
            } else if (value1['title'] !== '' && value1['title'] !== 'No') {
              spec2[key][key1] = value1['title'];
            } 
          }
        }
        
        specificationModel.specification = spec2;
        await specificationModel.save();

        const variant = {
          colorCode: colorCode,
          photo: photoModel._id,
          thumbnail: thumbnail,
          variantFields: variantFields  // Use the initialized variantFields
        };
        
        const variantModel = new Variants({ variants: [variant] }); // Use array for variants
        await variantModel.save();
        
        const model = new Model2({
          product: {
            productName: productName,
            productLink: productLink,
            type: type,
          },
          variants: variantModel._id,
          filters:  filter,
          properties: propertiesModel._id,
          specification: specificationModel._id,
          
        });

        const savedModel = await model.save();
        reply.code(201).send(savedModel);
      } catch (error) {
        console.error("Error adding model:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post(
    "/add-variant/:id",
    async (req, reply) => {
      try {
        let photos = [];
        let fileName;
        let variant = {};
        let thumbnail;
        let colorCode;
  
        const parts = req.parts();
  
        for await (const part of parts) {
          if (part.type === "file") {
            fileName = part.filename;
            const filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            if(part.fieldname === 'thumbnail'){
              thumbnail= `public/image/${fileName}`;
            }else{
              photos.push(`public/image/${fileName}`);
            }
            
          } else {
            if(part.fieldname=='colorCode'){
              colorCode = part.value;
            }else{
              variant[part.fieldname] = part.value;
            }
              
            }
        }
  
        const photoModel = new Photo({ photoList: photos });
        await photoModel.save();
  
        const variantModel = await Variants.findById(req.params.id);
        if (!variantModel) {
          return reply.code(404).send({ error: "Variant model not found" });
        }
  
        let isDuplicate = false;
        variantModel.variants.forEach((v) => {
          if (JSON.stringify(v.variantFields) === JSON.stringify(variant)) {
            isDuplicate = true;
          }
        });
  
        if (isDuplicate) {
          return reply.code(400).send({ error: "Duplicate variant" });
        }
  
        const newVariant = {
          photo: photoModel._id,
          thumbnail: thumbnail,
          colorCode: colorCode,
          variantFields: variant
        };
  
        variantModel.variants.push(newVariant); // Use push to add new variant to the array
        await variantModel.save();
  
        let model2 = await Model2.findOne({ variants: req.params.id });
  
        for await (let [key, value] of Object.entries(variant)) {
          let oldValue = model2.filters[key];
          if (oldValue.includes(value)) {
            console.log('value already added', value);
          } else {
            oldValue.push(value);
          }
  
          model2.filters[key] = oldValue;
        }
        model2.markModified('filters');
        await model2.save();
        console.log("Model updated successfully: ", model2);
  
        reply.code(201).send(model2);
      } catch (error) {
        console.error("Error adding variant:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );
}

module.exports = addSpecification;