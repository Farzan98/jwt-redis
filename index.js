// Require the framework and instantiate it
const app = require("fastify")({ logger: false });
const redis = require("redis");
const client = redis.createClient();
const jwt = require("jsonwebtoken");

app.register(require("@fastify/cookie"));

// Declare a route
app.get("/", async (req, res) => {
  return { hello: "world" };
});

const user = {
  email: "farzan.hassan@developers.studio",
  password: "farzan",
};

const customerId = "1111453349";

app.get("/login", async (req, res) => {
  try {
    const token = jwt.sign(
      {
        id: customerId,
        email: "farzan.hassan@developers.studio",
        password: "farzan",
      },
      "secret",
      { expiresIn: "1d" }
    );

    await client.set(customerId, token);

    return res.send({ statusCode: 200, id: customerId, token: token });
  } catch (error) {
    return res.send(error.message);
  }
});

app.post("/protected", async (req, res) => {
  try {
    const customerId = req.headers.authorization.split(" ")[1];
    // return res.send(customerId);
    jwt.verify(customerId, "secret", (err, data) => {
      return res.send(data);
    });
  } catch (error) {}
});

app.get("/logout", async (req, res) => {
  try {
    await client.del(customerId);
    return res.send(`Token deleted successfully.`);
  } catch (error) {
    return res.send(error.message);
  }
});

// Run the server!
const start = async () => {
  try {
    await client
      .connect()
      .then((conn) => {
        console.log(`Connection established successfully!`);
      })
      .catch((error) => {
        console.log(`Redis connection error`);
      });

    await app
      .listen({ port: 3000 })
      .then((conn) => {
        console.log(`Server lsitening!`);
      })
      .catch((error) => {
        console.log(`Server listening error`);
      });
  } catch (err) {
    app.log.error(err.message);
    process.exit(1);
  }
};
start();
