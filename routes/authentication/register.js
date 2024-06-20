const path = require("path");
const fs = require("fs");
const models = require("../../models/allModels");
const {
  Address,
  Customer,
  Retailer,
  Staff,
} = require("../../models/allModels");
const bcrypt = require("bcrypt");

async function registerUser(fastify, options) {
  fastify.post("/register", async (req, reply) => {
    try {
      const data = req.body;
      const type = req.body.type;
      let savedUser;

      const customer = new Customer(data);
      const retailer = new Retailer(data);
      const staff = new Staff(data);

      if (type == "customer") {
        savedUser = await customer.save();
      } else if (type == "retailer") {
        savedUser = await retailer.save();
      } else if (type == "staff") {
        savedUser = await staff.save();
      } else {
        return reply.send({ error: "something went wrong !" });
      }

      let savedAddress;
      if (type == "retailer") {
        data["retailer"] = savedUser._id;
        const UserAddres = new Address(data);
        savedAddress = await UserAddres.save();
      }

      const token = fastify.jwt.sign({ userId: savedUser });
      var status = "success";

      return reply.send({ savedAddress, savedUser, token, status });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.post(
    "/register-staff",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const userId = req.user.userId._id;
        const data = req.body;

        let savedUser;
        const ADMIN = await Staff.findById(userId);

        if(ADMIN.role == 0 && ADMIN.isActive){
          const staff = new Staff(data);
          savedUser = await staff.save();
        }
        
        var status = "success";

        return reply.send({ savedUser, status });
      } catch (error) {
        console.error(error);
        reply.status(500).send({ error: "Internal Server Error" });
      }
    }
  );
}

module.exports = registerUser;
