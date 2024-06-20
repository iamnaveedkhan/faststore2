const { Address, Retailer,Customer } = require("../../models/allModels");

async function getUser(fastify, options) {
  fastify.register(require("@fastify/multipart"));
  fastify.get(
    "/retailers",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        let existingData;
        existingData = await Address.find().populate("retailer");
        if(existingData.length>0){
          return existingData;
        }else{
          reply.code(404).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );

  fastify.get(
    "/customers",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        let existingData;
        existingData = await Customer.find();
        if(existingData.length>0){
          return existingData;
        }else{
          reply.code(404).send({ error: "No data found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );


  fastify.get(
    "/retailer/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.params.id;
        const existingUser = await Retailer.find({ _id: userId });
        if (existingUser) {
          reply.send(existingUser);
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
    "/customer/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.params.id;
        const existingUser = await Customer.find({ _id: userId });
        if (existingUser) {
          reply.send(existingUser);
        } else {
          reply.code(404).send({ error: "User not found" });
        }
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Internal server error" });
      }
    }
  );
}

module.exports = getUser;
