const path = require("path");
const fs = require("fs");
const fastify = require("fastify")({ logger: true });
const { parse } = require("csv-parse");

const {
  Types: { ObjectId },
} = require("mongoose");

const {
  Product,
  Brand,
  Model,
  Category,
  SubCategory,
  Offers,
  Inquiry,
  Model2,
  Retailer,
  Staff,
  Variants,
  Specification,
  Customer,
  Status,
  Properties,
  Photo,
} = require("../../models/allModels");
const bcrypt = require("bcrypt");
const { log } = require("console");

async function Upload(fastify, options) {
  fastify.register(require("@fastify/multipart"));

  fastify.post(
    "/offer/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const parts = req.parts();
        let userId = req.params.id;
        let fileName;
        let filePath;

        for await (const part of parts) {
          if (part.type === "file") {
            fileName = part.filename;
            filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
          }
        }

        const newOffer = new Offers({
          user: userId,
          photos: `public/image/${fileName}`,
        });

        const OfferSaved = await newOffer.save();
        console.log(OfferSaved);
        return { success: true, message: "offer saved successfully" };
      } catch (error) {
        console.error("Error saving offer:", error);
        return { success: false, message: "Failed to save offer" };
      }
    }
  );

  // fastify.post(
  //   "/product",
  //   { onRequest: [fastify.authenticate] },
  //   async function (req, reply) {
  //     try {
  //       const parts = req.parts();

  //       const { name, price, quantity } = req.body;
  //       const shop = req.user.userId._id;

  //       const existingProduct = await Product.findOne({
  //         $and: [{ "model._id": name }, { "user._id": shop }],
  //       });
  //       if (existingProduct) {
  //         existingProduct.quantity = quantity;
  //         existingProduct.price = price;

  //         await existingProduct.save();

  //         return { model_id: name, message: "Product updated successfully" };
  //       }
  //       // if (existingProduct) {

  //       //     return reply.status(409).send({ error: "Product Already Added" });
  //       // }
  //       else {
  //         const user_id = await User.findOne({ $or: [{ _id: shop }] });
  //         const mymodel = await Model.findOne({ _id: name });
  //         const cate = await Category.findOne({ _id: mymodel.category._id });
  //         const subcate = await SubCategory.findOne({
  //           _id: mymodel.subCategory._id,
  //         });
  //         const brnd = await Brand.findOne({ _id: mymodel.brand._id });
  //         const pht = await Photo.findOne({ model: name });
  //         const prod = new Product({
  //           model: {
  //             _id: mymodel._id,
  //             productName: mymodel.productName,
  //             photo: mymodel.photo,
  //             description:
  //               "this is automated description \n  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  //           },
  //           brand: {
  //             _id: brnd._id,
  //             brandName: brnd.brandName,
  //             brandImage: brnd.brandImage,
  //           },
  //           user: {
  //             _id: user_id._id,
  //             shopNumber: user_id.mobile,
  //             shopName: user_id.name,
  //           },
  //           category: {
  //             _id: cate._id,
  //             categoryName: cate.categoryName,
  //             categoryImage: cate.categoryImage,
  //           },
  //           subCategory: {
  //             _id: subcate._id,
  //             subCategoryName: subcate.subCategoryName,
  //             subCategoryImage: subcate.subCategoryImage,
  //             category: subcate.category,
  //           },
  //           photos: pht._id,
  //           specifications: { keyone: "value1" },
  //           price: price,
  //           quantity: quantity,
  //         });
  //         const ProdSaved = await prod.save();
  //       }

  //       return { model_id: name };
  //     } catch (error) {
  //       console.error("Error uploading file:", error);
  //       return reply.status(500).send("Internal Server Error");
  //     }
  //   }
  // );

  fastify.post(
    "/add-product2",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { price, quantity, mainId, variantId } = req.body;
        console.log(mainId, price, quantity, variantId);
        const userId = req.user.userId._id;

        let savedProduct;

        const existingProduct = await Product.findOne({
          $and: [{ "variants._id": variantId }, { user: userId }],
        });

        if (existingProduct) {
          console.log("existing");
          existingProduct.quantity = quantity;
          existingProduct.price = price;

          await existingProduct.save();

          return existingProduct;
        } else {
          const user = await Retailer.findById(userId);

          if (!user) {
            return reply.code(404).send({ error: "User not found" });
          }
          const allVariant = await Variants.findById(mainId);
          let variant = {};
          let filter = {};
          for await (const value of allVariant.variants) {
            if (value._id == variantId) {
              value.variantFields.forEach((value2, key) => {
                filter[key] = value2;
              });
              variant = value;
            }
          }

          const product = await Model2.findOne({ variants: allVariant._id });

          if (!product) {
            return reply.code(404).send({ error: "Product not found" });
          }
          for await (let [key, value] of Object.entries(product.filters)) {
            console.log(`before value  ${value}`);
            console.log(`before key   ${key}`);
            if (!filter.hasOwnProperty(key)) {
              console.log(`after value   ${value[0]}`);
              console.log(`after key   ${key}`);
              filter[key] = value[0];
            } else {
              console.log("have already");
            }
          }
          const newProductData = {
            price: price,
            variantId: allVariant,
            variants: variant,
            quantity: quantity,
            specification: product.specification,
            properties: product.properties,
            product: {
              productName: product.product.productName,
              productLink: product.product.productLink,
              type: product.product.type,
            },
            filter: filter,
            user: user,
          };

          const newProduct = Product(newProductData);
          savedProduct = await newProduct.save();
        }

        reply.send(savedProduct);
      } catch (error) {
        console.error("Error creating product:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post(
    "/add-product",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { price, quantity, productId } = req.body;
        console.log(productId, price, quantity);
        const userId = req.user.userId._id;

        let savedProduct;

        const existingProduct = await Product.findOne({
          $and: [{ "product._id": productId }, { user: userId }],
        });

        if (existingProduct) {
          existingProduct.quantity = quantity;
          existingProduct.price = price;

          await existingProduct.save();

          return existingProduct;
        } else {
          const user = await Retailer.findById(userId);

          if (!user) {
            return reply.code(404).send({ error: "User not found" });
          }

          const product = await Model2.findById(productId);

          if (!product) {
            return reply.code(404).send({ error: "Product not found" });
          }

          const newProductData = {
            price: price,
            quantity: quantity,
            product: product,
            user: user,
          };

          const newProduct = Product(newProductData);
          savedProduct = await newProduct.save();
        }

        reply.send(savedProduct);
      } catch (error) {
        console.error("Error creating product:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.get(
    "/enquiry/:id",
    { onRequest: [fastify.authenticate] },
    async function (req, reply) {
      try {
        const productId = req.params.id;

        let user =
          (await Customer.findById(req.user.userId._id)) ||
          (await Retailer.findById(req.user.userId._id));

        if (!user) {
          return reply.code(401).send({ error: "You are not authorized!" });
        }

        const existingInquiry = await Inquiry.findOne({
          "product._id": productId,
          "customer._id": user._id,
        });
        if (existingInquiry) {
          return { shopName: existingInquiry.shop.shopName };
        }

        const existingProduct = await Product.findById(productId).populate(
          "user"
        );

        if (!existingProduct) {
          return reply.code(404).send({ error: "Product not found" });
        }

        const shop = existingProduct.user;

        const inquiry = new Inquiry({
          customer: {
            _id: user._id,
            customerNumber: user.mobile,
            customerName: user.name,
          },
          shop: {
            _id: shop._id,
            shopNumber: shop.mobile,
            shopName: shop.name,
          },
          product: {
            _id: existingProduct._id,
            productName: existingProduct.product.productName,
            variantId: existingProduct.variantId,
            variants: existingProduct.variants,
          },
        });

        await inquiry.save();

        existingProduct.enquired += 1;
        await existingProduct.save();

        return { shopName: shop.name };
      } catch (error) {
        console.error("Error during enquiry process:", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );

  fastify.post("/addmodel", async (req, reply) => {
    try {
      // Parse form data
      const data = {};
      let fileName;

      for await (const part of req.parts()) {
        if (part.file) {
          // It's a file, save it
          fileName = part.filename;
          const filePath = path.join("public/image/", fileName);
          const writableStream = fs.createWriteStream(filePath);
          await part.file.pipe(writableStream);
          data["photo"] = `public/image/${fileName}`;
        } else {
          // Handle other form fields
          if (part.fieldname.startsWith("variants[]")) {
            del; // It's a variant field
            data[part.fieldname] = part.value;
          } else if (part.fieldname.startsWith("properties.")) {
            // Convert string values to ObjectId
            data[part.fieldname] = part.value;
          } else {
            data[part.fieldname] = part.value;
          }
        }
      }

      // Add variants data to the data object

      // Create a new model instance with the parsed data
      const newModel = new Model2(data);

      // Save the model to the database
      const savedModel = await newModel.save();

      // Respond with the saved model
      return savedModel;
    } catch (error) {
      // Handle errors
      console.error("Error adding model:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.post(
    "/add-models",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const data = {};
        let photos = [];
        let fileName;

        for await (const part of req.parts()) {
          if (part.file) {
            fileName = part.filename;
            const filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            photos.push(`public/image/${fileName}`);
          } else {
            if (part.fieldname.startsWith("specification.")) {
              data[part.fieldname] = part.value;
            } else if (part.fieldname.startsWith("properties.")) {
              // Convert string values to ObjectId
              data[part.fieldname] = part.value;
            } else if (part.fieldname == "type") {
              // Convert string values to ObjectId
              data[part.fieldname] = part.value;
            } else if (part.fieldname == "productName") {
              // Convert string values to ObjectId
              data[part.fieldname] = part.value;
            } else {
              data[part.fieldname] = part.value;
            }
          }
        }
        data["photo"] = photos;
        const newModel = new Model2(data);

        const savedModel = await newModel.save();

        return savedModel;
      } catch (error) {
        console.error("Error adding model:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post(
    "/update-model/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelId = req.params.id;
        const existingModel = await Model2.findById(modelId);

        if (!existingModel) {
          return reply.code(404).send({ error: "Model not found" });
        }

        let newPhotos = [];
        let fileUploaded = false;

        for await (const part of req.parts()) {
          if (part.file) {
            fileUploaded = true;
            console.log(part.filename);
            const fileName = part.filename;
            const filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            newPhotos.push(filePath); // Ensure file path consistency
          } else {
            if (part.fieldname.startsWith("specification.")) {
              existingModel.set(part.fieldname, part.value);
            } else if (part.fieldname === "productName") {
              existingModel.productName = part.value;
            } else if (part.fieldname === "productLink") {
              existingModel.productLink = part.value;
            } else {
              existingModel.set(part.fieldname, part.value);
            }
          }
        }

        if (fileUploaded) {
          // Remove previously stored images if new images are uploaded
          if (existingModel.photo) {
            for (const photoPath of existingModel.photo) {
              fs.unlink(photoPath, (err) => {
                if (err) console.error(`Failed to delete ${photoPath}:`, err);
              });
            }
          }
          existingModel.photo = newPhotos;
        } else {
          // Keep the previous photos if no new images are uploaded
          existingModel.photo = existingModel.photo || [];
        }

        const updatedModel = await existingModel.save();

        return updatedModel;
      } catch (error) {
        console.error("Error updating model:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post(
    "/update-model-or-product-specific-titles",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const models = await Model2.find();

        if (!models || models.length === 0) {
          return reply.code(404).send({ error: "No models found" });
        }

        const updateTitlesToYes = (obj) => {
          for (const key in obj) {
            if (typeof obj[key] === "object" && obj[key] !== null) {
              if (obj[key].title) {
                obj[key].title = obj[key].title.trim();
              }
              updateTitlesToYes(obj[key]);
            }
          }
        };

        const updatedModels = [];

        for (const model of models) {
          updateTitlesToYes(model.specification);
          model.markModified("specification"); // Ensure Mongoose knows 'specification' was modified
          const updatedModel = await model.save();
          updatedModels.push(updatedModel);
        }

        return reply.code(200).send(updatedModels);
      } catch (error) {
        console.error("Error updating models:", error);
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post(
    "/addvariant/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const data = {};
        let photos = [];
        let fileName;
        data["groupId"] = req.params.id;
        for await (const part of req.parts()) {
          if (part.file) {
            console.log(part.filename);
            fileName = part.filename;
            const filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            photos.push(`public/image/${fileName}`);
          } else {
            if (part.fieldname.startsWith("specification.")) {
              data[part.fieldname] = part.value;
            } else if (part.fieldname.startsWith("properties.")) {
              // Convert string values to ObjectId
              data[part.fieldname] = part.value;
            } else if (part.fieldname == "type") {
              // Convert string values to ObjectId
              data[part.fieldname] = part.value;
            } else if (part.fieldname == "productName") {
              // Convert string values to ObjectId
              data[part.fieldname] = part.value;
            } else if (part.fieldname === "brandId") {
              data["brand"] = await Brand.findById({ _id: part.value });
            } else {
              data[part.fieldname] = part.value;
            }
          }
        }

        data["photo"] = photos;
        const newModel = new Model2(data);

        const savedModel = await newModel.save();

        return savedModel;
      } catch (error) {
        console.error("Error adding model:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post("/set-model-isActive/:id", async (req, reply) => {
    const Id = req.params.id;
    const isActive = req.body.isChecked;

    let updatedData;

    if (Id.length > 10) {
      updatedData = await Model2.findById({ _id: Id });
      updatedData.isActive = isActive;
      await updatedData.save();
    } else {
      const data = await Model2.find({ groupId: Id });
      updatedData = await Promise.all(
        data.map(async (item) => {
          item.isActive = isActive;
          await item.save();
          return item;
        })
      );
    }

    return updatedData;
  });

  fastify.post("/set-customer-retailer-isActive/:id", async (req, reply) => {
    try {
      const Id = req.params.id;
      const isActive = req.body.isChecked;
      const { type } = req.body;
      let updatedData;

      if (type == "retailer") {
        updatedData = await Retailer.findById(Id);
      } else if (type == "customer") {
        updatedData = await Customer.findById(Id);
      } else {
        reply.send({ error: "Something Went Wrong !" });
      }
      updatedData.isActive = isActive;
      await updatedData.save();

      return updatedData;
    } catch (error) {
      console.error("Error :", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.post("/set-user-data", async (req, reply) => {
    try {
      const parts = req.parts();
      const users = [];
      const errors = [];

      for await (const part of parts) {
        if (part.file) {
          const parser = part.file.pipe(parse({ columns: true, trim: true }));

          for await (const record of parser) {
            const { name, mobile, email } = record;

            if (!name || !mobile || !email) {
              errors.push({
                record,
                error: "Missing required fields (name, mobile, email)",
              });
              continue;
            }

            if (isNaN(mobile)) {
              errors.push({ record, error: "Invalid mobile number" });
              continue;
            }

            try {
              const existingData = await Retailer.findOne({ mobile });

              if (!existingData) {
                const userData = {
                  name,
                  mobile,
                  email,
                  status: 2,
                  isActive: false,
                };

                const newUser = new Retailer(userData);
                const savedUser = await newUser.save();
                users.push(savedUser);
              } else {
                errors.push({
                  record,
                  error: "User with these mobile numbers already exists",
                });
              }
            } catch (dbError) {
              errors.push({ record, error: dbError.message });
            }
          }
        }
      }
      return reply
        .code(207)
        .send({ message: "Processing completed", users, errors });
    } catch (error) {
      console.error("Error:", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.post(
    "/update-retailers-status",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { rId, StatusWantToSet, latestComment } = req.body;

        const Id = req.user.userId._id;
        const staff = await Staff.findById(Id);
        if (!staff) {
          return reply.code(401).send({ error: "Unauthorized!" });
        }

        let retailerData = await Retailer.findOne({ rId: rId });

        reply.send({ msg: "Retailer Not Found!" });
        if (retailerData) {
          retailerData.status = StatusWantToSet;
          retailerData.comment = latestComment;
          await retailerData.save();
          reply.send("Status Updated Successfully ! ");
        } else {
          return reply.code(401).send({ error: "Retailer Not Found!" });
        }

        const statusData = new Status();
        statusData.manager = Id;
        statusData.retailer = retailerData._id;
        statusData.comment = latestComment;
        statusData.status = StatusWantToSet;
        await statusData.save();
      } catch (error) {
        console.error("Error:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post(
    "/three-D-model/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        let fileName;
        let threeDmodel;
        console.log("cccccc", req.params.id);

        for await (const part of req.parts()) {
          if (part.file) {
            console.log(part.filename);
            fileName = part.filename;
            const filePath = path.join("public/glb/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            threeDmodel = `public/glb/${fileName}`;
          }
        }
        const variant = Variants.findById(req.params.id);
        variant.model3d = threeDmodel;
        await variant.save();

        return threeDmodel;
      } catch (error) {
        console.error("Error:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post(
    "/view-update-variants/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      const id = req.params.id;
      const varaintData = await Variants.findById(id).populate({
        path: "variants",
        populate: {path:"photo",
          model:"Photo"
        },
      });
      return varaintData;
      
    }
  );
}

module.exports = Upload;
