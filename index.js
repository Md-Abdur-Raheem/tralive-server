const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middle wear
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aimii.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("Tralive");
        const dectinationsCollection = database.collection("destinations");
        
        //get api to get 6 destinations
        app.get('/destinations', async (req, res) => {
            const cursor = dectinationsCollection.find({}).limit(6);
            const destinations = await cursor.toArray();
            res.send(destinations);
        })

        //get api to get all destinations
        app.get('/all-destinations', async (req, res) => {
            const cursor = dectinationsCollection.find({});
            const destinations = await cursor.toArray();
            res.send(destinations);
        })

        //post api to add new destination
        app.post('/add-new-destination', async (req, res) => {
            console.log(req.body);
            const newDestination = req.body;
            const result = await dectinationsCollection.insertOne(newDestination);
            console.log(result);
            res.json(result);
        })

    }
    finally {
        //await client.close()
    }
}
run().catch(console.dir);


app.get('/', (req, res) => res.send('Hello world'));
app.listen(port, () => console.log("Running server on port", port))
