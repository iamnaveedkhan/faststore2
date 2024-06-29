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
        let mrp = 0;
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
            }else if (part.fieldname == "mrp") {
              mrp = part.value;
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
          mrp:mrp,
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
          thumbnail:thumbnail,
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
    "/update-model2/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const data = {};
        let fileName;
        let spec = {};
        let spec2 = {};
        
        thumbnail = ``;
        const model = Model2.findById(req.params.id)
        const propertiesModel = Properties.findOne({_id:model.properties})
        const parts = req.parts();

        for await (const part of parts) {
          if (part.type === "file") {
            fileName = part.filename;
            const filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            if(part.fieldname === "thumbnail"){
              model.product.thumbnail = `public/image/${fileName}`
            }
          } else {
            if (part.fieldname.startsWith("specification.")) {
              spec[part.fieldname] = part.value;
            } else if (part.fieldname.startsWith("properties.")) {
              const key = part.fieldname.split("properties.")[1];
              propertiesModel[key] = part.value;
            } else if (part.fieldname == "type") {
              model.product.type = part.value;
            } else if (part.fieldname == "productName") {
              model.product.productName = part.value;
            }else if (part.fieldname == "productLink") {
              model.product.productLink = part.value;
            } else {
              data[part.fieldname] = part.value;
            }
          }
        }
        



        await propertiesModel.save();
        
        const specificationModel = await Specification2.findOne({_id:model.specification});
        specificationModel.specification = spec;
        await specificationModel.save();
        
        for await (const [key, value] of Object.entries(specificationModel.specification)) {
          spec2[key] = {};
          for (const [key1, value1] of Object.entries(value)){
            if (value1['isVariant'] === 'true' && value1['title'] !== '' && value1['title'] !== 'No') {
              model.product.filter[key1] = [value1['title']];
            } else if (value1['isFilter'] === 'true' && value1['isVariant'] === 'false' && value1['title'] !== '' && value1['title'] !== 'No') {
              spec2[key][key1] = value1['title'];
              model.product.filter[key1] = [value1['title']];
            } else if (value1['title'] !== '' && value1['title'] !== 'No') {
              spec2[key][key1] = value1['title'];
            } 
          }
        }
        
        specificationModel.specification = spec2;
        await specificationModel.save();
        model.markModified();
        const savedModel = await model.save();
        reply.code(201).send(savedModel);
      } catch (error) {
        console.error("Error adding model:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.get('/variantFields/:id',async (req,reply)=>{
    try {
      const variantId = req.params.id;
      const variantFields = await Variants.findById(variantId);
      return variantFields.variants[0].variantFields;

    } catch (error) {
      console.error("Error fetching variantFields :", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  })

  fastify.post(
    "/add-variant/:id",
    async (req, reply) => {
      try {
        let photos = [];
        let fileName;
        let variant = {};
        let thumbnail;
        let colorCode;
        let mrp=0;
  
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
            }else if(part.fieldname=='mrp'){
              mrp = part.value;
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
          mrp:mrp,
          variantFields: variant
        };
  
        variantModel.variants.push(newVariant);
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



  fastify.post(
    "/update-variant/:id/:variantFieldId",
    async (req, reply) => {
      try {
        let photos = [];
        let photoId;
        let variant = {};
        let fileName;

        const variantModel = await Variants.findById(req.params.id);
        for await (const x of variantModel.variants){
          if(x._id==req.params.variantFieldId){
            variant=x;
            photoId=x.photo
          }
        }
        let model2 = await Model2.findOne({ variants: req.params.id });

        // for await (let [key, value] of Object.entries(variant.variantFields)) {
        //   let oldValue = model2.filters[key];
        //   if (oldValue.includes(value)) {
        //     oldValue.remove(value);
        //   }
  
        //   model2.filters[key] = oldValue;
        // }
  
        const parts = req.parts();
  
        let variantFields = {};

        for await (let x of variantModel.variants){
          if(x._id==req.params.variantFieldId){
       
            for await (const part of parts) {
              if (part.type === "file") {
                fileName = part.filename;
                const filePath = path.join("public/image/", fileName);
                const writableStream = fs.createWriteStream(filePath);
                await part.file.pipe(writableStream);
                if(part.fieldname === 'thumbnail'){
                  x.thumbnail= `public/image/${fileName}`;
                }else{
                  photos.push(`public/image/${fileName}`);
                }
                
              } else {
                if(part.fieldname=='colorCode'){
                  x.colorCode = part.value;
                }else if(part.fieldname=='mrp'){
                  x.mrp = part.value;
                }else{
                  console.log(`fieldname         ${part.value}`);
                  variantFields[part.fieldname] = part.value;
                  console.log(variantFields[part.fieldname]);
                } 
                }
            }
            x.variantFields = variantFields
            
            
          }
        }


        
        await variantModel.save();
        const photoModel =await Photo.findById(photoId);
        photoModel.photoList = photos;
        photoModel.markModified('photoList');
        await photoModel.save();
  
        
  
        // for await (let [key, value] of Object.entries(variant.variantFields)) {
        //   let newfilters = model2.filters;
        //   if(newfilters.includes(key)){
        //     let oldValue = model2.filters[key];
        //   if (oldValue.includes(value)) {
        //     oldValue.push(value);
        //   }
        //   }
          
  
        //   model2.filters[key] = oldValue;
        // }
        model2.markModified('filters');
        await model2.save();
  
        reply.code(201).send(variantModel);
      } catch (error) {
        console.error("Error adding variant:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );


}

module.exports = addSpecification;
