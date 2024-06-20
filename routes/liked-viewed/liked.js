const { Product, Liked } = require("../../models/allModels");

async function getLiked(fastify, options) {

    // -----------post route---------------

    fastify.post(
      "/liked/:id",
      { onRequest: [fastify.authenticate] },
      async (req, reply) => {
        try {
          const userId = req.user.userId._id;
          const requestedProductId = req.params.id;
    
          let user = await Liked.findOne({ user: userId });
          if (!user) {
            user = new Liked({ user: userId, liked: [] });
          }
    
          const index = user.liked.indexOf(requestedProductId);
    
          if (index === -1) {
            user.liked.push(requestedProductId);
            await user.save();
            reply.send({ message: "Product liked successfully" });
          } else {
            user.liked.splice(index, 1);
            await user.save();
            reply.send({ message: "Product unliked successfully" });
            
          }
        } catch (error) {
          console.error(error);
          reply.code(500).send({ error: "Internal server error" });
        }
      }
    );
    

    // -----------get route---------------

  fastify.get(
    "/get-liked-products",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.user.userId._id;
        
        const user = await Liked.findOne({ user: userId });
        const likedProductIds = user.liked;
        console.log(likedProductIds);

        const likedProducts = await Product.find({
          _id: { $in: likedProductIds },
        }).populate("user");

        reply.send(likedProducts);
      } catch (error) {
        console.error("Error fetching liked products:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );

  fastify.get(
    "/liked-or-not/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.user.userId._id;
        const productId = req.params.id;

        const userLikedData = await Liked.findOne({ user: userId });
        if (!userLikedData) {
          return reply
            .status(404)
            .send({ error: "Liked data not found for the user" });
        }

        const likedOrNot = userLikedData.liked.includes(productId);

        reply.send(likedOrNot);
      } catch (error) {
        console.error("Error fetching liked-or-not : ", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}

module.exports = getLiked;
