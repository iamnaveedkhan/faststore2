const { model } = require("mongoose");
const {
  Chat,
  Product,
  Retailer,
  Customer,
  Model,
  Brand,
  Category,
  SubCategory,
  Inquiry,
  Model2,
  Specification,
  Offers,
  Staff,
  Address,
  Specification2,
} = require("../../models/allModels");

async function getProduct(fastify, options) {
  fastify.register(require("@fastify/multipart"));

  fastify.get("/products", async (req, reply) => {
    try {
      const existingData = await Product.find().populate("user");

      if (existingData.length > 0) {
        reply.send(existingData);
      } else {
        console.log("user not found");
        reply.code(204).send({ error: "No data found" });
      }
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: "Internal server error" });
    }
  });

  fastify.get("/productalldetails", async (req, reply) => {
    try {
      const existingData = await Product.find().populate("user");

      if (existingData.length > 0) {
        console.log(existingData);
        reply.send(existingData);
      } else {
        reply.code(202).send({ error: "No data found" });
      }
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: "Internal server error" });
    }
  });

  fastify.get(
    "/product/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.params.id;
        let existingData;
        if (userId.length > 10) {
          existingData = await Product.find({ _id: userId }).populate("user").populate("variantId").populate("specification");
        } else {
          existingData = await Product.find({
            "product.groupId": userId,
          }).populate("user");
        }

        if (existingData.length > 0) {
          reply.send(existingData);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/productsbysubcategory/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const subCategoryId = req.params.id;
        const existingData = await Product.find({
          "product.properties.subcategory": subCategoryId,
        }).populate("user");

        if (existingData) {
          reply.send(existingData);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/productsbycategory/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const categoryId = req.params.id;
        const existingData = await Model2.find({
          "properties.category": categoryId,
        });

        if (existingData) {
          reply.send(existingData);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/productsbyvertical/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const verticalId = req.params.id;
        const existingData = await Model2.find({
          "properties.vertical": verticalId,
        });

        if (existingData) {
          reply.send(existingData);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/selectedsubcategory/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const category = req.params.id;
        const existingData = await SubCategory.find({
          category: category,
        });

        if (existingData.length) {
          reply.send(existingData);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/subCategory/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const subCategoryId = req.params.id;
        const existingSubCategory = await SubCategory.findOne({
          _id: subCategoryId,
        });
        if (existingSubCategory) {
          reply.send(existingSubCategory);
        } else {
          reply.code(404).send({ error: "User not found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/models",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const existingData = await Model2.find().populate('variants').populate('specification');
        console.log(existingData.length);
        if (existingData.length > 0) {
          reply.send(existingData);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/model/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelId = req.params.id;
        let existingModel;

        if (modelId.length > 10) {
          existingModel = await Model2.find({ _id: modelId });
        } else {
          console.log(modelId);
          existingModel = await Model2.find({
            groupId: modelId,
          });
        }

        if (existingModel.length > 0) {
          console.log(existingModel);
          reply.send(existingModel);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/modelsbycategory/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelId = req.params.id;
        // const subcate = await SubCategory.findOne({ _id: modelId });
        const existingData = await Model2.find({
          "properties.subcategory": modelId,
        });
        console.log(existingData);
        if (existingData) {
          reply.send(existingData);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/inquiries",
    { onRequest: [fastify.authenticate] },
    async function (req, reply) {
      try {
        const userId =
          (await Customer.findOne({ _id: req.user.userId._id })) ||
          (await Retailer.findOne({ _id: req.user.userId._id }));

        console.log(userId);
        let existingData;
        if (userId.cId) {
          existingData = await Inquiry.find({ "customer._id": userId._id });
          console.log(existingData);
        } else if (userId.rId) {
          existingData = await Inquiry.find({ "shop._id": userId._id });
          console.log(existingData);
        } else {
          return reply.code(403).send({ error: "Unauthorized access" });
        }
        if (existingData.length > 0) {
          reply.send(existingData.reverse());
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/inquiries/:id",
    { onRequest: [fastify.authenticate] },
    async function (req, reply) {
      try {
        const userId =
          (await Customer.findOne({ _id: req.params.id })) ||
          (await Retailer.findOne({ _id: req.params.id }));

        if (!userId) {
          reply.code(404).send({ error: "User not found !" });
        }
        let existingData;
        if (userId.cId) {
          existingData = await Inquiry.find({ "customer._id": userId._id });
          console.log(existingData);
        } else if (userId.rId) {
          existingData = await Inquiry.find({ "shop._id": userId._id });
          console.log(existingData);
        } else {
          return reply.code(403).send({ error: "Unauthorized access" });
        }
        if (existingData.length > 0) {
          reply.send(existingData.reverse());
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/allinquiries",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        const startDateTime = new Date(startDate);
        const endDateTime = new Date(endDate);

        endDateTime.setDate(endDateTime.getDate() + 1);

        const existingData = await Inquiry.find({
          date: {
            $gte: startDateTime,
            $lt: endDateTime,
          },
        });

        if (existingData.length > 0) {
          reply.send(existingData);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/inquiry/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const inquiryId = req.params.id;
        const existingInquiry = await Inquiry.findOne({ _id: inquiryId });
        if (existingInquiry) {
          reply.send(existingInquiry);
        } else {
          reply.code(404).send({ error: "Inquiry not found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/specification/:id",
    // { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const specificationId = req.params.id;
        const existingSpecifications = await Specification.find({
          $or: [{ _id: specificationId }, { category: specificationId }],
        });
        if (existingSpecifications.length > 0) {
          reply.send(existingSpecifications);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/specifications",

    async (req, reply) => {
      try {
        const existingSpecifications = await Specification.find();
        if (existingSpecifications.length > 0) {
          reply.send(existingSpecifications);
        } else {
          reply.code(204).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/activeCustomerandRetailerList/:type",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const type = req.params.type;
        let existingData;
        if (type == "customer") {
          existingData = await Customer.find({ isActive: true });
        } else if (type == "retailer") {
          existingData = await Retailer.find({
            $and: [{ isActive: true }, { manager: { $ne: null } }],
          });
        } else {
          reply.code(401).send({ error: "Unauthroized !" });
        }

        if (existingData.length > 0) {
          return existingData;
        } else {
          return "no data found";
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/chat",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      let existingData;
      const userid = req.user.userId._id;

      let user =
        (await Customer.findById({ _id: userid })) ||
        (await Retailer.findById({ _id: userid }));

      if (user.cId) {
        existingData = await Chat.find({ customer: userid }).populate(
          "product"
        ).populate("customer").populate("retailer");
      } else if (user.rId) {
        existingData = await Chat.find({ retailer: userid }).populate(
          "product"
        ).populate("customer").populate("retailer");
      }
      reply.send(existingData);
    }
  );

  fastify.get(
    "/nearbyAndOffers",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const EARTH_RADIUS_KM = 6371;
        const maxDistance = 5;
        const userId = req.user.userId._id;
        console.log(userId);

        // Retrieve user's location
        const user = await Customer.findById(userId);
        const userLatitude = parseFloat(user.latitude);
        const userLongitude = parseFloat(user.longitude);

        // Calculate latitude and longitude ranges
        const deltaLatitude = (maxDistance / EARTH_RADIUS_KM) * (180 / Math.PI);
        const deltaLongitude =
          ((maxDistance / EARTH_RADIUS_KM) * (180 / Math.PI)) /
          Math.cos((userLatitude * Math.PI) / 180);
        const minLatitude = userLatitude - deltaLatitude;
        const maxLatitude = userLatitude + deltaLatitude;
        const minLongitude = userLongitude - deltaLongitude;
        const maxLongitude = userLongitude + deltaLongitude;

        const nearbyUsers = await Retailer.find({
          latitude: { $gte: minLatitude, $lte: maxLatitude },
          longitude: { $gte: minLongitude, $lte: maxLongitude },
        });

        const uniqueProducts = await Product.aggregate([
          {
            $match: {
              user: { $in: nearbyUsers.map((user) => user._id) },
            },
          },
          {
            $group: {
              _id: "$product",
              products: { $push: "$$ROOT" },
            },
          },
          { $unwind: "$products" },
          { $sort: { "products.price": 1 } },
          // { $limit: 10 },
          {
            $group: {
              _id: "$_id",
              product: { $first: "$products" },
            },
          },
          { $replaceRoot: { newRoot: "$product" } },
        ]);

        // await Promise.all(
        //   uniqueProducts.map(async (prod) => {
        //     // prod.product = await Model2.findById(prod.product._id);
        //     prod.user = await Retailer.findById(prod.user._id);
        //   })
        // );


        // await Promise.all(
        //   uniqueProducts.map(async (prod) => {
        //     // prod.product = await Model2.findById(prod.product._id);
        //     prod.Specification = await Specification2.findById(prod.specification._id);
        //   })
        // );

        const activeOffers = await Offers.find({
          user: { $in: nearbyUsers },
          isActive: true,
        });
        reply.send({
          offer: activeOffers,
          product: uniqueProducts,
        });
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
  fastify.get(
    "/productsOnRetailer",
    { onRequest: [fastify.authenticate] },
    async (req, resp) => {
      try {
        const userid = req.user.userId._id;
        console.log(userid);
        const existingData = await Product.find({ user: userid }).populate(
          "user"
        );

        return existingData;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/modeltoproduct/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelOrProductId = req.params.id;
        existingData = await Model2.find({ _id: modelOrProductId });
        reply.send(existingData);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/editproduct/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelOrProductId = req.params.id;
        const userid = req.user.userId._id;

        let existingData = "";
        existingData = await Product.find({
          $and: [{ "product._id": modelOrProductId }, { user: userid }],
        }).populate("user");

        reply.send(existingData);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/modelfind/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelOrProductId = req.params.id;
        const userid = req.user.userId._id;

        const existingData = await Model2.find({ groupId: modelOrProductId });

        reply.send(existingData);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/priceandcount/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelOrProductId = req.params.id;
        const userid = req.user.userId._id;

        const existingData = await Product.findOne({
          $and: [{ "product._id": modelOrProductId }, { user: userid }],
        });
        reply.send({ count: existingData.quantity, price: existingData.price });
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/brandToModel/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const brandId = req.params.id;
        const userid = req.user.userId._id;
        const userData = await Retailer.findById({ _id: userid });

        let existingData;
        if (userData) {
          existingData = await Model2.find({ "properties.brand": brandId });
        } else {
          reply.send({ error: "Not authroized" });
        }

        reply.send(existingData);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/brand-to-product/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const Id = req.params.id;
        let existingData;

        existingData = await Product.find({
          "product.properties.brand": Id,
        }).populate("user");
        reply.send(existingData);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/retailers-product/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userid = req.params.id;
        const userData = await Retailer.findById({ _id: userid });
        let existingData;

        if (userData) {
          existingData = await Product.find({ user: userData }).populate(
            "user"
          );
        } else {
          reply.send({ error: "Not authroized" });
        }

        reply.send(existingData);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/notHavingtheRequestedUser",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.user.userId._id;
        const userData = await Retailer.findById(userId);

        if (!userData) {
          return reply.send({ error: "Not authorized" });
        }
        const models = await Model2.find();
        // Aggregate to get unique products by groupId
        // const uniqueProducts = await Product.aggregate([
        //   {
        //     $group: {
        //       _id: "$groupId",
        //       products: { $push: "$$ROOT" }, // Push all documents with the same groupId into an array
        //     },
        //   },
        //   { $unwind: "$products" }, // Unwind to get each product separately
        //   {
        //     $lookup: {
        //       from: "users",
        //       localField: "products.user",
        //       foreignField: "_id",
        //       as: "user"
        //     }
        //   },
        //   { $unwind: "$user" }, // Unwind to get the user details
        //   {
        //     $group: {
        //       _id: "$products._id",
        //       product: { $first: "$products" }, // Keep the first product encountered for each groupId
        //       user: { $first: "$user" } // Keep the associated user
        //     }
        //   },
        //   { $replaceRoot: { newRoot: "$product" } }
        // ]);

        // // Filter out products associated with the requested user
        // const productsNotAssociated = uniqueProducts.filter(product => product.user._id.toString() !== userId);
        // console.log(productsNotAssociated.length);
        // reply.send(productsNotAssociated);
        reply.send(models);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/inquiriesby-groupid-id/:Id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const Id = req.params.Id;
        let enquiryData;

        if (Id.length < 10) {
          enquiryData = await Inquiry.find({ "product.groupId": Id });
        } else if (Id.length > 10) {
          enquiryData = await Inquiry.find({ "product.modelId": Id });
        } else {
          return reply.status(400).send({ error: "Invalid ID length" });
        }

        return reply.send(enquiryData);
      } catch (error) {
        console.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/available-in/:Id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const Id = req.params.Id;
        let products;

        if (Id.length < 10) {
          products = await Product.find({
            "product.groupId": Id,
          }).populate("user");
        } else {
          products = await Product.find({ "product._id": Id }).populate("user");
        }
        let userData = [];
        products.forEach((product, index) => {
          userData[index] = product.user;
        });

        return userData;
      } catch (error) {
        console.error(error);
        return reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get("/retailers-product-admin/:id", async (req, reply) => {
    try {
      const Id = req.params.id;
      const data = await Product.find({ user: Id });
      return data;
    } catch (error) {
      console.error("Error :", error);
      reply.code(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.get(
    "/ten-retailer-details",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const Id = req.user.userId._id;

        const manager = await Staff.findById(Id);
        console.log(manager);
        if (!manager) {
          return reply.code(401).send({ error: "Unauthroizd !" });
        }

        if (manager.role == 1) {
          const dataIsAvailable = await Retailer.find({
            $and: [{ manager: manager._id }, { status: 3 }],
          })
            .limit(10)
            .populate("manager");

          if (dataIsAvailable.length > 0) {
            console.log("In Available : ", dataIsAvailable.length);
            return reply.send(dataIsAvailable);
          }

          const dataIsNotAvailable = await Retailer.find({
            $and: [{ manager: null }, { isActive: false }, { status: 2 }],
          }).limit(10);

          for await (let data of dataIsNotAvailable) {
            data.manager = manager._id;
            data.status = 3;
            await data.save();
            console.log("found");
          }
          await Promise.all(
            dataIsNotAvailable.map(async (prod) => {
              // prod.product = await Model2.findById(prod.product._id);
              prod.manager = await Staff.findById(prod.manager._id);
            })
          );
        } else {
          return reply.code(401).send({ error: "Unauthroizd !" });
        }
        console.log("In Not Available : ", dataIsNotAvailable.length);
        return reply.send(dataIsNotAvailable);
      } catch (error) {
        console.error("Error :", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.post(
    "/findSingleData",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelId = req.body.modelId;
        const retailerId = req.body.retailerId;
        const EARTH_RADIUS_KM = 6371;
        const maxDistance = 5;
        const userId = req.user.userId._id;

        const user = await Customer.findById(userId);
        const userLatitude = parseFloat(user.latitude);
        const userLongitude = parseFloat(user.longitude);

        const deltaLatitude = (maxDistance / EARTH_RADIUS_KM) * (180 / Math.PI);
        const deltaLongitude =
          ((maxDistance / EARTH_RADIUS_KM) * (180 / Math.PI)) /
          Math.cos((userLatitude * Math.PI) / 180);
        const minLatitude = userLatitude - deltaLatitude;
        const maxLatitude = userLatitude + deltaLatitude;
        const minLongitude = userLongitude - deltaLongitude;
        const maxLongitude = userLongitude + deltaLongitude;

        const nearbyUsers = await Retailer.find({
          latitude: { $gte: minLatitude, $lte: maxLatitude },
          longitude: { $gte: minLongitude, $lte: maxLongitude },
        });

        const uniqueProducts = await Product.find({
          "product._id": modelId,
          user: retailerId,
        }).populate("user");
        if (uniqueProducts.length == 0) {
          console.log("not found");
          const myProduct = await Product.find({
            "product._id": modelId,
            user: { $in: nearbyUsers },
          })
            .limit(1)
            .populate("user");
          return reply.send(myProduct);
        }
        console.log(uniqueProducts);
        reply.send(uniqueProducts);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/retailersOfProduct/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelId = req.params.id;
        const EARTH_RADIUS_KM = 6371;
        const maxDistance = 5;
        const userId = req.user.userId._id;

        const user = await Customer.findById(userId);
        const userLatitude = parseFloat(user.latitude);
        const userLongitude = parseFloat(user.longitude);

        const deltaLatitude = (maxDistance / EARTH_RADIUS_KM) * (180 / Math.PI);
        const deltaLongitude =
          ((maxDistance / EARTH_RADIUS_KM) * (180 / Math.PI)) /
          Math.cos((userLatitude * Math.PI) / 180);
        const minLatitude = userLatitude - deltaLatitude;
        const maxLatitude = userLatitude + deltaLatitude;
        const minLongitude = userLongitude - deltaLongitude;
        const maxLongitude = userLongitude + deltaLongitude;

        const nearbyUsers = await Retailer.find({
          latitude: { $gte: minLatitude, $lte: maxLatitude },
          longitude: { $gte: minLongitude, $lte: maxLongitude },
        });

        const myProduct = await Product.find({
          "product._id": modelId,
          user: { $in: nearbyUsers },
        }).populate("user");
        return reply.send(myProduct);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.post(
    "/all-retailers",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const Id = req.user.userId._id;
        const staff = await Staff.findById(Id);
        if (!staff) {
          return reply.code(401).send({ error: "Unauthorized!" });
        }

        const { isActive, status, startdate, enddate } = req.body;
        let pickedRetailers;

        const startDateTime = new Date(startdate);
        const endDateTime = new Date(enddate);
        endDateTime.setDate(endDateTime.getDate() + 1);

        if (staff.role == 0) {
          pickedRetailers = await Retailer.find({
            $and: [
              { status: status },
              { isActive: isActive },
              {
                date: {
                  $gte: startDateTime,
                  $lt: endDateTime,
                },
              },
            ],
          });
        } else {
          if (status == 3) {
            pickedRetailers = await Retailer.find({
              $and: [{ manager: staff._id }, { status: 3 }],
            })
              .limit(10)
              .populate("manager");

            if (pickedRetailers.length > 0) {
              console.log("In Available : ", pickedRetailers.length);
              return reply.send(pickedRetailers);
            }

            pickedRetailers = await Retailer.find({
              $and: [{ manager: null }, { isActive: false }, { status: 2 }],
            }).limit(10);

            for await (let data of pickedRetailers) {
              data.manager = staff._id;
              data.status = 3;
              await data.save();
              console.log("found");
            }
            await Promise.all(
              pickedRetailers.map(async (prod) => {
                prod.manager = await Staff.findById(prod.manager._id);
              })
            );
          } else {
            pickedRetailers = await Retailer.find({
              $and: [
                { status: status },
                { manager: staff._id },
                { isActive: isActive },
                {
                  date: {
                    $gte: startDateTime,
                    $lt: endDateTime,
                  },
                },
              ],
            });
          }
        }

        return reply.send(pickedRetailers);
      } catch (error) {
        console.error("Error:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.get(
    "/nearbyFeatured",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const EARTH_RADIUS_KM = 6371;
        const maxDistance = 5;
        const userId = req.user.userId._id;

        // Retrieve user's location
        const user = await Customer.findById(userId);
        const userLatitude = parseFloat(user.latitude);
        const userLongitude = parseFloat(user.longitude);

        // Calculate latitude and longitude ranges
        const deltaLatitude = (maxDistance / EARTH_RADIUS_KM) * (180 / Math.PI);
        const deltaLongitude =
          ((maxDistance / EARTH_RADIUS_KM) * (180 / Math.PI)) /
          Math.cos((userLatitude * Math.PI) / 180);
        const minLatitude = userLatitude - deltaLatitude;
        const maxLatitude = userLatitude + deltaLatitude;
        const minLongitude = userLongitude - deltaLongitude;
        const maxLongitude = userLongitude + deltaLongitude;

        const nearbyUsers = await Retailer.find({
          latitude: { $gte: minLatitude, $lte: maxLatitude },
          longitude: { $gte: minLongitude, $lte: maxLongitude },
        });

        const uniqueProducts = await Product.aggregate([
          {
            $match: {
              user: { $in: nearbyUsers.map((user) => user._id) },
              featured: true
            },
          },
          {
            $group: {
              _id: "$product",
              products: { $push: "$$ROOT" },
            },
          },
          { $unwind: "$products" },
          { $sort: { "products.price": 1 } },
          // { $limit: 10 },
          {
            $group: {
              _id: "$_id",
              product: { $first: "$products" },
            },
          },
          { $replaceRoot: { newRoot: "$product" } },
        ]);

        await Promise.all(
          uniqueProducts.map(async (prod) => {
            // prod.product = await Model2.findById(prod.product._id);
            prod.user = await Retailer.findById(prod.user._id);
          })
        );

       
        reply.send(uniqueProducts);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
}

module.exports = getProduct;
