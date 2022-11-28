const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qkf0jrq.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
   
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).send('unauthorised access');

    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token , process.env.ACCESS_TOKEN, function (err, decoded) {
        if(err){
            return res.status(500).send({message:'forbidden access'});
        }
        req.decoded = decoded;
        next();
    })
}



async function run (){
    try{
        const appointmentOptionCollection=client.db('resellProduct').collection('appointmentOptions');
        const bookingsCollection=client.db('resellProduct').collection('bookings');
        const usersCollection=client.db('resellProduct').collection('users');
        const productsCollection=client.db('resellProduct').collection('products');
        const paymentsCollection=client.db('resellProduct').collection('payments');

        const verifyAdmin = async(req, res, next) => {
            console.log('inside verifyadmin', req.decoded.email);
            const decodedEmail = req.decoded.email;

            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);
            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'});
            }
            next();
        }




        app.get('/appointmentOptions', async(req, res) => {
            const date=req.query.date;
            console.log(date);
            const query = {};
            const options = await appointmentOptionCollection.find(query).toArray();
            res.send(options);
        });

        //category data load
        // app.get('/appointmentOptions/category/:id', async(req, res)=>{
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const category = await appointmentOptionCollection.find(id);
        //     res.send(category);
        // })

        //bookings get
        app.get('/bookings',verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !== decodedEmail) {
                return res.status(403).send({message:'forbidden access'})
            }

            const query = {email: email};
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        })

        //bookings
        app.post('/bookings', async(req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        });

        //booking id payment
        app.get('/bookings/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })


        //all user data 
        app.get('/users', async(req, res) => {
            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users);
        });
        //jwt token is
        app.get('/jwt', async(req, res) => {
            const email =req.query.email;
            const query = {email: email};
            const user = await usersCollection.findOne(query);
            if(user){
                const token = jwt.sign({email}, process.env.ACCESS_TOKEN, {expiresIn: '1h'});
                return res.send({accessToken: token});
            }
            res.status(403).send({accessToken: ''})
        });

        //payment success
        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const price = booking.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency:'usd',
                amount: amount,
                "payment_method_types":[
                    "card",
                ]
            });
            res.send({
                clientSecret: paymentIntent.client_secret,
              });
        });

        //payments colection
        app.post('/payments', async (req, res) => {
           const payment = req.body;
           const result = await paymentsCollection.insertOne(payment);
           res.send(result); 
        })
        
    

        //users posting 
        app.post('/users', async(req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);

        });

        //admin user
        app.put('/users/admin/:id',verifyJWT,verifyAdmin,  async(req, res) => {
            const decodedEmail = req.decoded.email;

            const query = {email: decodedEmail};
            const user = await usersCollection.findOne(query);
            if(user?.role !== 'admin'){
                return res.status(403).send({message: 'forbidden access'});
            }

            const id = req.params.id;
            const filter = { _id : ObjectId (id) };
            const options = { upsert: true};
            const updatedDoc = {
                $set:{
                    role: 'admin',
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);

        });

        //admin user get//user admin ki na?
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
        });

        //admin add special product 
        app.get('/appointmentSpecialty', async(req, res)=>{
            const query = {}
            const result = await appointmentOptionCollection.find(query).project({title:1}).toArray();
            res.send(result);       
        });
        //manage product
        app.get('/products',verifyJWT,verifyAdmin, async(req, res)=>{
            const query = {};
            const products = await productsCollection.find(query).toArray();
            res.send(products); 
        });

        //manage product delete
        app.delete('/products/:id',verifyJWT,verifyAdmin, async (req, res)=>{
           const id = req.params.id;
           const filter = { _id: ObjectId(id) } ;
           const result = await productsCollection.deleteOne(filter);
           res.send(result);
        })


        app.post('/products',verifyJWT,verifyAdmin, async (req, res)=>{
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.send(result); 
        })


    }
    finally{

    }
}
run().catch(console.log);





app.get('/', (req, res) => {
    res.send('assignment 12 server is running')
});



app.listen(port, () => {
    console.log(`assignment 12 server running on port ${port}`)
})