const path = require("path");
const fs = require("fs");
const { Retailer, Address } = require("../../models/allModels");

async function updateUser(fastify, options) {
 
  fastify.post(
    "/update-retailer/:id",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const retailerID = req.params.id;
        const data = req.body;
        
        let retailerAddress = await Address.findOne({ retailer: retailerID });
  
        if (data.address) {
          retailerAddress.address = data.address;
        }
  
        await retailerAddress.save();
  
        return retailerAddress;
  
      } catch (error) {
        console.error("Error processing request:", error);
        reply.status(500).send("Internal Server Error");
      }
    }
  );
  
}

module.exports = updateUser;
