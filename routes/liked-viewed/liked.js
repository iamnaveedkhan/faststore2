const { Product, Liked, Customer } = require("../../models/allModels");

async function getLiked(fastify, options) {
  // -----------post route---------------

  fastify.post(
    "/liked/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.user.userId._id;
        const requestedProductId = req.params.id;

        let likedUserData = await Liked.findOne({ user: userId });
        if (!likedUserData) {
          likedUserData = new Liked({ user: userId, liked: [] });
        }

        const index = likedUserData.liked.indexOf(requestedProductId);

        let userData = await Customer.findById(userId);

        if (index === -1) {
          likedUserData.liked.push(requestedProductId);
          userData.liked++;
          await userData.save();
          await likedUserData.save();
          reply.send({ message: "Product liked successfully" });
        } else {
          likedUserData.liked.splice(index, 1);
          userData.liked--;
          await userData.save();
          await likedUserData.save();
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

  // -----------------------------------liked-for-dashboard-----------------------------------

  fastify.get(
    "/likedCounts-likedProducts/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const customerId = req.params.id;
        const likedData = await Liked.findOne({ user: customerId });
  
        if (likedData) {
          const likedProducts = await Product.find({
            _id: { $in: likedData.liked },
          })
          reply.send({ likedCount: likedProducts.length ,likedProdcuts: likedProducts });
        } else {
          console.log("No liked data found for the user.");
          reply.status(404).send({ error: "No liked data found for the user." });
        }

      } catch (error) {
        console.log("Error fetching likedCounts-likedProducts:", error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
  

}

module.exports = getLiked;
