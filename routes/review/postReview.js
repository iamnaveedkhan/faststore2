const { ProductReview, ShopReview } = require("../../models/allModels");
const path = require("path");
const fs = require("fs");

async function postreview(fastify, options) {
  fastify.register(require("@fastify/multipart"));

  fastify.post(
    "/shop-review",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const customerId = req.user.userId._id;
        const { retailerId, review, rating } = req.body;

        let existingReview = await ShopReview.findOne({
          retailer: retailerId,
          customer: customerId,
        });

        if (existingReview) {
          existingReview.review = review;
          existingReview.rating = rating;
          const updatedReview = await existingReview.save();
          return reply.send(updatedReview);
        } else {
          const newReview = new ShopReview({
            retailer: retailerId,
            customer: customerId,
            review: review,
            rating: rating,
          });

          const newShopReview = await newReview.save();
          return reply.send(newShopReview);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );
  fastify.post(
    "/product-review",
    { onRequest: [fastify.authenticate] },
    async (req, reply) => {
      try {
        const customerId = req.user.userId._id;

        const parts = req.parts();
        let variantId;
        let reviewText = "";
        let rating;
        let fileName;
        let filePath;
        let image = [];

        for await (const part of parts) {
          if (part.type === "file") {
            fileName = part.filename;
            filePath = path.join("public/image/", fileName);
            const writableStream = fs.createWriteStream(filePath);
            await part.file.pipe(writableStream);
            image.push(`public/image/${fileName}`);
          } else if (part.type === "field") {
            if (part.fieldname === "variantId") {
              variantId = part.value;
            } else if (part.fieldname === "review") {
              reviewText = part.value;
            } else if (part.fieldname === "rating") {
              rating = part.value;
            }
          }
        }

        if (!variantId) {
          return reply.status(400).send({ error: "Product ID is required" });
        }

        const existingReview = await ProductReview.findOne({
          productGroupId: variantId,
          customer: customerId,
        });

        if (existingReview) {
          existingReview.review = reviewText;
          existingReview.rating = rating;
          existingReview.image = image;
          const updatedReview = await existingReview.save();
          return reply.send({
            message: "Review updated successfully",
            review: updatedReview,
          });
        } else {
          const newReview = new ProductReview({
            productGroupId: variantId,
            customer: customerId,
            review: reviewText,
            image: image,
            rating: rating,
          });

          const savedReview = await newReview.save();
          return reply.send({
            message: "Review submitted successfully",
            review: savedReview,
          });
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        return reply.status(500).send("Internal Server Error");
      }
    }
  );
}

module.exports = postreview;
