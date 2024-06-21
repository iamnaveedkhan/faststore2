const { ProductReview, ShopReview } = require("../../models/allModels");

async function getreview(fastify, options) {
  //------------------Shop---------------------------------

  fastify.get(
    "/shop-review/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const id = req.params.id;
        const shopReviews = await ShopReview.find({ retailer: id }).populate({
          path: "customer",
          select: "name mobile",
        });
        return shopReviews;
      } catch (error) {
        console.error("Error getting shop review ! ", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );

  fastify.get(
    "/your-shop-review",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const customerId = req.user.userId._id;
        const shopReviews = await ShopReview.find({
          customer: customerId,
        }).populate({
          path: "customer",
          select: "name mobile",
        });
        return { shopReviews, true: true };
      } catch (error) {
        console.error("Error getting shop review ! ", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );

  //------------------product---------------------------------

  fastify.get(
    "/product-reviews/:groupid",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const groupid = req.params.groupid;
        const productReview = await ProductReview.find({productGroupId: groupid,}).populate({
          path: "customer",
          select: "name mobile",
        });
        return productReview;
      } catch (error) {
        console.error("Error getting shop review ! ", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );


  fastify.get(
    "/your-product-review/:groupid",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const groupid = req.params.groupid;
        const customerId = req.user.userId._id;
        const productReview = await ProductReview.find({productGroupId: groupid,customer : customerId }).populate({path: "customer", select: "name mobile", });

        return { productReview, true: true };
      } catch (error) {
        console.error("Error getting shop review ! ", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );
}

module.exports = getreview;
