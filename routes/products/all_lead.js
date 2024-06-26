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
  Properties,
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
    "/product/:id/:retailer",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {


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
        const id = req.params.id;
        const retailer = req.params.retailer;
        console.log('Received parameters:', { userId, retailer });

        let existingData;
        // if (userId.length > 10) {
        existingData = await Product.find({ $and: [{ "variants._id": id }, { "user":retailer }] })
          .populate("user")
          .populate("specification")
          .populate("variantId")
          .populate({
            path: "variants",
            populate: {
              path: "photo",
              model: "Photo",
            },
          });
        // } else {
        //   existingData = await Product.find({
        //     "product.groupId": userId,
        //   }).populate('user');
        // }
        console.log('Query result:', existingData);
        if (existingData.length > 0) {
          console.log('in if');
          reply.send(existingData);
        } else {
        
          console.log('in else');
          const nearbyUsers = await Retailer.find({
          latitude: { $gte: minLatitude, $lte: maxLatitude },
          longitude: { $gte: minLongitude, $lte: maxLongitude },
        });
          existingData = await Product.find({ $and: [{ "variants._id": id }, {user: { $in: nearbyUsers }}] }).limit(1)
          .populate("user")
          .populate("specification")
          .populate("variantId")
          .populate({
            path: "variants",
            populate: {
              path: "photo",
              model: "Photo",
            },
          });
          reply.send(existingData);
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
        const existingData = await Model2.find().populate('properties')
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
        const userId = req.params.id;
        let existingData;

        existingData = await Model2.find({ variants: userId })
        .populate("specification")
        .populate({
          path: "variants",
          populate: {
            path: "variants.photo",
            model: "Photo",
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
        existingData = await Chat.find({ customer: userid })
          .populate("product")
          .populate("customer")
          .populate("retailer");
      } else if (user.rId) {
        existingData = await Chat.find({ retailer: userid })
          .populate("product")
          .populate("customer")
          .populate("retailer");
      }
      reply.send(existingData);
    }
  );

  fastify.get(
    "/nearbyAndOffers/:page",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const EARTH_RADIUS_KM = 6371;
        const maxDistance = 5;
        const userId = req.user.userId._id;
        const page = parseInt(req.params.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;
  
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
              _id: "$variants._id",
              products: { $push: "$$ROOT" },
            },
          },
          { $unwind: "$products" },
          { $sort: { "products.price": 1 } },
          {
            $group: {
              _id: "$_id",
              product: { $first: "$products" },
            },
          },
          { $replaceRoot: { newRoot: "$product" } },
          { $skip: skip },
          { $limit: limit },
        ]);
  
        const activeOffers = await Offers.find({
          user: { $in: nearbyUsers },
          isActive: true,
        }).skip(skip).limit(limit);
  
        reply.send({
          offer: activeOffers,
          product: uniqueProducts,
          currentPage: page,
          totalOffers: activeOffers.length,
          totalProducts: uniqueProducts.length,
        });
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
  


  fastify.get(
    "/nearByRetailers/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.params.id;

        const nearbyUsers = await Retailer.findById(userId);

        
        reply.send(nearbyUsers.mobile);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/nearby-retailers",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
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
        const retailorsProducts = await Product.find({
          user: { $in: nearbyUsers },
        }).populate("user");
        let users = [];
        for await (const x of retailorsProducts) {
          if(!users.includes(x.user)){
            users.push(x.user);
          }
          
        }

        reply.send(users);
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
        const existingData = await Product.find({ user: userid });

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

        const existingData = await Model2.find({ variants: modelOrProductId })
          .populate("variants")
          .populate("specification")
          .populate({
            path: "variants",
            populate: {
              path: "variants.photo",
              model: "Photo",
            },
          });

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
          $and: [{ "variants._id": modelOrProductId }, { user: userid }],
        });
        reply.send({ count: existingData.quantity, price: existingData.price });
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/brand-to-model/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const Id = req.params.id;
        let existingData;

       const properties = await Properties.find({
          "brand": Id,
        });
        existingData = await Model2.find({
          properties:{ $in: properties }
        })
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

       const properties = await Properties.find({
          "brand": Id,
        });
        existingData = await Product.find({
          properties:{ $in: properties }
        })
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
          existingData = await Product.find({ user: userData });
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
    "/inquiries-by-variantId/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const id = req.params.id;

        let enquiryData = await Inquiry.find({ "product.variantId": id });
        if(enquiryData<0) {
          return reply.status(400).send({ error: "Enquiries Not found!" });
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
    "/retailersOfProduct/:id/:number",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const modelId = req.params.id;
        const number = req.params.number;
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
          "variants._id": modelId,
          user: { $in: nearbyUsers },
        }).populate("user");
        if(number==1){
          return reply.send(myProduct);
        }else{
          return reply.send(myProduct.length);
        }
        
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
              featured: true,
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

        reply.send(uniqueProducts);
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

fastify.get("/data-for-update-model/:id", async (req, reply) => {
  try {
    const modelId = req.params.id;
    const modelData = await Model2.findById(modelId)
      .populate({
        path: "properties",
        populate: {
          path: "vertical",
          select: "specification", 
        },
      })
      .populate({
        path: "specification",
        select: "specification", // Adjust the fields you want to select from the specification model
      });

    return modelData;
  } catch (error) {
    console.error("Error :", error);
    reply.code(500).send({ error: "Internal Server Error" });
  }
});

// fastify.get("/dataType-change", async (req, reply) => {
//   try {
//     const propertiesDocs2 = await Properties.find();

//     for await (const doc of propertiesDocs2) {
      
//       const updates = await Properties.findById(doc._id);
//         const category = await Category.findById(updates.category)
//         updates.category = category;
  
//         const subcategory = await SubCategory.findById('6605ade2f1093ac2287348a2')
//         updates.subcategory = subcategory;

//         const vertical = await Specification.findById('663f2dd3018c49357e8f4730')
//         updates.vertical = vertical;
  
//         const brand = await Brand.findById(updates.brand)
//         updates.brand = brand;
//         updates.markModified('brand');
//         await updates.save();
      
//     }

//     reply.send({ message: "Data type conversion completed successfully" });
//   } catch (error) {
//     console.error("Error :", error);
//     reply.code(500).send({ error: "Internal Server Error" });
//   }
// });



}

module.exports = getProduct;
