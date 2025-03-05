const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

//db connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@c-1.racht.mongodb.net/?retryWrites=true&w=majority&appName=C-1`;

//mongodb client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const db = client.db("sunnah-storeDB");

    //collections
    const productsCollection = db.collection("products");
    const usersCollection = db.collection("users");

    //post a user to db
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = {email: user.email}
      const userExists = await usersCollection.findOne(query);
      if (userExists) {
        return res.status(400).send({message: "User already exists"})
      }
      const result = await usersCollection.insertOne(user);
      res.send({
        status: "success",
        data: result,
      });
    });

    // get a single user from db
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.findOne({
        _id: new ObjectId(id),
      });

      res.status(200).send(result);
    });

    // get all users from db
    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find().toArray();
        res.send(users);
      } catch (error) {
        console.log("Users not found");
      }
    });

    // delete a single user from db
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });


    // get all products from db
    app.get("/products", async (req, res) => {
      try {
        const products = await productsCollection
          .find(/*{
            price: { $gt: 500 },
          }*/)
          .toArray();
        res.send(products);
      } catch (error) {
        console.log("Products not found");
      }
    });

    // get a single product from db
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productsCollection.findOne({
        _id: new ObjectId(id),
      });

      res.status(200).send(result);
    });

    // delete a single product from db
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const result = await productsCollection.deleteOne({
        _id: new ObjectId(id),
      });
      res.send(result);
    });

    // update a single product in db
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const options = { upsert: true };
      const result = await productsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedProduct },
        options
      );
      res.send(result);
    });

    //post products to db
    app.post("/products", async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send({
        status: "success",
        data: result,
      });
    });
    console.log("Connected to MongoDB!");
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to the sunnah-store server");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
