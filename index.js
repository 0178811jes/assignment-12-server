const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qkf0jrq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run (){
    try{
        const appointmentOptionCollection=client.db('resellProduct').collection('appointmentOptions');
        const bookingsCollection=client.db('resellProduct').collection('bookings');

        app.get('/appointmentOptions', async(req, res) => {
            const date=req.query.date;
            console.log(date);
            const query = {};
            const options = await appointmentOptionCollection.find(query).toArray();
            res.send(options);
        });
        //bookings
        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })



    }
    finally{

    }
}
run().catch(console.log);




//client side theke load//

const categories = require('./data/Categories.json');
const allProducts = require('./data/ProductCategory.json');

app.get('/', (req, res) => {
    res.send('assignment 12 server is running')
});

app.get('/product-categories', (req, res) => {
    res.send(categories);
});

app.get('/category/:id', (req, res) => {
    const id = req.params.id;
    const categoryProduct = allProducts.filter(product => product.category_id === id);
    res.send(categoryProduct);
})

app.get('/product/:id', (req, res) => {
    const id = req.params.id;
    const selectProduct = allProducts.find(product => product._id === id);
    res.send(selectProduct);
});

app.listen(port, () => {
    console.log(`assignment 12 server running on port ${port}`)
})