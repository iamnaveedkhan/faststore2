const { Customer, Retailer } = require("../../models/allModels");
async function location(fastify, options) {
  fastify.post(
    "/savelocation",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const { latitude, longitude } = req.body;
        const userid = req.user.userId._id;
        console.log(userid);
        const userData = await Customer.findById(userid) || await Retailer.findById(userid);


        userData.latitude = latitude;
        userData.longitude = longitude;

        await userData.save();

        return userData;
      } catch (error) {
        console.error("Error adding model:", error);
        reply.code(500).send({ error: "Internal Server Error" });
      }
    }
  );
}

module.exports = location;
