const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6qre6yi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const allBooksCollection = client.db('scholarNet').collection('allBooks')

    // add from all books form 
    app.post('/allBooks', async(req, res)=>{
        const newBooks = req.body;
        const result = await allBooksCollection.insertOne(newBooks);
        res.send(result)
    })
    
    // finding the all Books
    app.get('/allBooks', async(req, res) =>{
        const books = await allBooksCollection.find().toArray();
        res.send(books)
    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('Library server is running')
});

app.listen(port, ()=>{
    console.log(`Server started on ${port}`)
})