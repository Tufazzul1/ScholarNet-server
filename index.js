const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors({
    origin: ["https://scholarnet-2fc12.web.app",
        "https://scholarnet-2fc12.firebaseapp.com",
        "http://localhost:5173"]
}));
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

        const allBooksCollection = client.db('scholarNet').collection('allBooks');
        const categoryCollection = client.db('scholarNet').collection('category');
        const borrowCollection = client.db('scholarNet').collection('borrow');

        // add from all books form 
        app.post('/allBooks', async (req, res) => {
            const newBooks = req.body;
            const result = await allBooksCollection.insertOne(newBooks);
            res.send(result)
        })
        // finding the all Books
        app.get('/allBooks', async (req, res) => {
            const books = await allBooksCollection.find().toArray();
            res.send(books)
        })
        // finding all category
        app.get('/categories', async (req, res) => {
            const books = await categoryCollection.find().toArray();
            res.send(books)
        })
        // finding single category
        app.get('/categories/:category', async (req, res) => {
            const books = await categoryCollection.find().toArray();
            res.send(books)
        })
        // Book details
        app.get('/allBooks/:id', async (req, res) => {
            const id = req.params.id;
            const result = await allBooksCollection.findOne({ _id: new ObjectId(id) })
            res.send(result)
        })
        // borrow books
        app.post('/borrow', async (req, res) => {
            const newBooks = req.body;
            const result = await borrowCollection.insertOne(newBooks);
            res.send(result)
        })
        app.post('/borrow', async (req, res) => {
            const newBorrow = req.body;
            const bookId = newBorrow.bookId;
        
            const book = await allBooksCollection.findOne({ _id: new ObjectId(bookId) });
        
            if (book.quantity > 0) {
                const borrowResult = await borrowCollection.insertOne(newBorrow);
                const updateResult = await allBooksCollection.updateOne(
                    { _id: new ObjectId(bookId) },
                    { $inc: { quantity: -1 } }
                );
                res.send({ borrowResult, updateResult });
            } else {
                res.status(400).send({ error: 'Book out of stock' });
            }
        });
        
        
        // finding borrow books
        app.get('/borrow', async (req, res) => {
            // console.log(req.query?.email)
            let query = {};
            if (req.query?.email) {
                query = { email: req.query?.email }
            }
            const books = await borrowCollection.find(query).toArray();
            res.send(books)
        })
        // update Book
        app.put('/allBooks/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedBook = req.body
            const book = {
                $set: {
                    name: updatedBook.name,
                    category: updatedBook.category,
                    image: updatedBook.image,
                    rating: updatedBook.rating,
                    author: updatedBook.author
                }
            }
            const result = await allBooksCollection.updateOne(filter, book, options)
            res.send(result)

        })
        // return borrow
        app.delete('/borrow/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await borrowCollection.deleteOne(filter);
            res.send(result)
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


app.get('/', (req, res) => {
    res.send('Library server is running')
});

app.listen(port, () => {
    console.log(`Server started on ${port}`)
})