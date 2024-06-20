const { Customer, Retailer, Staff } = require("../../models/allModels");
async function login(fastify, options) {
  fastify.post("/login", async (req, reply) => {
    try {
      const { mobile, type, firetoken } = req.body;
      let existingUser;
      let status;

      if (!mobile) {
        return { err: "Field cannot be empty" };
      }

      if (type == "customer") {
        existingUser = await Customer.findOne({
          $and: [{ mobile: mobile }],
        });
      } else if (type == "retailer") {
        existingUser = await Retailer.findOne({
          $and: [{ mobile: mobile, isActive: true }],
        });
      } else {
        reply.send({ error: "Something went wrong !" });
      }

      if (existingUser) {
        existingUser.firetoken = firetoken;
        await existingUser.save();
        console.log(mobile);
        const token = fastify.jwt.sign({ userId: existingUser });
        const id = existingUser._id;
        status = "success";
        reply.send({ token, id, status, existingUser });
      } else {
        status = "fail";
        return reply.status(401).send({ error: "User not found...", status });
      }
    } catch (error) {
      console.error("Error during login:", error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });

  fastify.post("/staff-login", async (req, reply) => {
    try {
      const { mobileOrEmail, password } = req.body;
      console.log(mobileOrEmail, password);
      
      if (!mobileOrEmail) {
        return reply.status(400).send({ error: "Email/Mobile field cannot be empty" });
      }
  
      let query;
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobileOrEmail);
      if (isEmail) {
        query = { email: mobileOrEmail };
      } else {
        query = { mobile: mobileOrEmail };
      }
  
      const user = await Staff.findOne(query);
  
      if (!user) {
        return reply.status(401).send({ error: "User not found" });
      }
  
      if (user.password !== password) {
        return reply.status(401).send({ error: "Incorrect password" });
      }
  
      if (!user.isActive) {
        return reply.status(403).send({ error: "User is not active" });
      }
  
      const token = fastify.jwt.sign({ userId: user });
      const id = user._id;
      const status = "success";
      const role = user.role;
  
      reply.send({ token, id, status, user, role });
    } catch (error) {
      console.error("Error during login:", error);
      return reply.status(500).send({ error: "Internal Server Error" });
    }
  });
  
  
}

module.exports = login;
