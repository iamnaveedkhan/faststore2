const fastifyRoot = require("fastify");
require("dotenv").config();
const { connect } = require("./db");
const fastify = fastifyRoot({logger:true});
const bcrypt = require("bcrypt");
const path = require("node:path");


fastify.register(require("@fastify/cors"), (instance) => {
  return (req, callback) => {
    const corsOptions = {
      origin: true,
    };

    if (/^localhost$/m.test(req.headers.origin)) {
      corsOptions.origin = false;
    }

    callback(null, corsOptions);
  };
});



fastify.register(require("@fastify/view"), {
  engine: {
    ejs: require("ejs"),
  },
});

fastify.register(require("@fastify/jwt"), {
  secret: "naveed",
  cookie: {
    cookieName: "token",
    signed: false,
  },
});

fastify.register(require("@fastify/cookie"));

fastify.register(require("@fastify/formbody"));

fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/public/",
});

const { User, Product, Brand, Category, Model2 } = require("./models/allModels");

fastify.decorate("authenticate", async (req, reply) => {
  try {
    await req.jwtVerify();
    console.log("verification successfull");
  } catch (error) {
    reply.send(error);
  }
});

fastify.get('/search/:key', async (req, reply) => {
  try {
    const key = req.params.key;
    const searchRegex = new RegExp(key, 'i'); 

    const data = await Product.find({
      $or: [
        // { "brand.brandName": { $regex: searchRegex } },
        { "product.productName": { $regex: searchRegex } },
        { "product.type": { $regex: searchRegex } },
      ]
    });
    
    reply.send(data);
  } catch (error) {
    console.error('Error during search:', error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
});

fastify.get('/search-models/:key', async (req, reply) => {
  try {
    const key = req.params.key;
    const searchRegex = new RegExp(key, 'i'); 

    const data = await Model2.find({
      $or: [
        // { "brand.brandName": { $regex: searchRegex } },
        { "product.productName": { $regex: searchRegex } },
        { "product.type": { $regex: searchRegex } },
      ]
    });
    
    reply.send(data);
  } catch (error) {
    console.error('Error during search:', error);
    reply.status(500).send({ error: 'Internal Server Error' });
  }
});


fastify.register(require("./routes/brand/index"));
fastify.register(require("./routes/category/index"));
fastify.register(require("./routes/subcategory/index"));
fastify.register(require("./routes/user/index"));
fastify.register(require("./routes/chat/index"));
fastify.register(require("./routes/authentication/index"));
fastify.register(require("./routes/products/index"));

fastify.register(require("./routes/specification/index"));
fastify.register(require("./routes/model/index"));
fastify.register(require("./routes/liked-viewed/index"));
fastify.register(require("./routes/location/index"));
fastify.register(require("./routes/dashboard/index"));
fastify.register(require("./routes/review/index"));
const start = async () => {
  await connect();
  try {
    await fastify.listen({ port: 8081,host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
