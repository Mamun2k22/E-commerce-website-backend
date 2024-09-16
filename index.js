require("dotenv").config(); // Load environment variables from .env file

const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Define the port
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Vholamart Is Running Now");
});

// Get the URI from environment variables
const uri = process.env.MONGO_URL;

if (!uri) {
  throw new Error(
    "MongoDB connection string is not defined in the environment variables"
  );
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

// Connect to the MongoDB client and start the server
async function run() {
  try {
    const categoriesCollection = client.db("bholamart").collection("categoriesname");
    const productsCollection = client.db("bholamart").collection('products');

    await client.connect();
    console.log("Connected to MongoDB");

    app.get('/products', async (req, res) => {
      const query = {};
      const products = await productsCollection.find(query).toArray();
      res.send(products);
  });

    // API to get the categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const category = await categoriesCollection.find(query).toArray();
      res.send(category);
    });

    app.get('/category/:name', async (req, res) => {
      try {
        const category = req.params.name;
        console.log(category)
        console.log(`Requested Category: ${category}`);
        
        // Query the products collection using categoryName field
        const products = await productsCollection.find({ categoryName: category }).toArray();
        
        if (!products || products.length === 0) {
          res.status(404).send({ message: "No products found for this category." });
        } else {
          res.send(products);
        }
      } catch (error) {
        console.error("Error fetching products by category:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    
    // product details
    app.get('/products/:id', async (req, res) => {
      try {
        const { id } = req.params;  // Corrected to just req.params
        console.log(id)
        const query = { _id: new ObjectId(id) };  // Ensure ObjectId is properly created
        const product = await productsCollection.findOne(query); 
        if (!product) {
          return res.status(404).send({ message: "Product not found" });
        }
        res.send(product);
      } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
      }
    });
    

    // Start the server only after the MongoDB connection is established
    app.listen(port, () => {
      console.log(`Vholamart Is Running Now on port ${port}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run().catch(console.dir);
