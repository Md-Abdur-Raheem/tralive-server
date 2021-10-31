const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 7000;

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
        const usersBooking = database.collection('usersBooking');
        
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
            const newDestination = req.body;
            const result = await dectinationsCollection.insertOne(newDestination);
            res.json(result);
        })

        //get api to find a destination
        app.get('/all-destinations/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await dectinationsCollection.findOne(query);
            res.json(result);
        })

        //use post to get data by keys
        app.post('/all-destinations/by_id', async (req, res) => {
            const id = req.body;
            console.log(req);
            const query = { id: { $in: id } }
            const result = await dectinationsCollection.find(query).toArray();
            res.json(result);
        })

        //get users booking
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const exists = await usersBooking.findOne({ email: email });
            res.send(exists)
        })


        //add and update users bookings
        app.post('/users/by_email', async (req, res) => {
            const email = req.body.email;
            const booking = req.body.booking;

            const exists = await usersBooking.findOne({ email: email });
            if (exists) {
                const previousBooking = exists.booking;
                    const filter = { email: email };
                    const options = { upsert: true };
                    const updateDoc = {
                        $set: {
                            email: email,
                            booking: previousBooking.concat(booking)
                      },
                    };
                    const result = await usersBooking.updateOne(filter, updateDoc, options);
                    res.json(result);                
            }
            else {
                const result = await usersBooking.insertOne(req.body);
                res.json(result);
            }
        })

    }
    finally {
        //await client.close()
    }
}
run().catch(console.dir);


app.get('/', (req, res) => res.send('Hello world'));
app.listen(port, () => console.log("Running server on port", port))
