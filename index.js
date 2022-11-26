const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jsonwebtoken = require('jsonwebtoken');
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
        const usersCollection=client.db('resellProduct').collection('users');

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
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
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
        })

        //users posting 
        app.post('/users', async(req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user);
            res.send(result);

        });

        //admin user
        app.put('/users/admin/:id', async(req, res) => {
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

        //admin user get
        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            req.send({isAdmin: user?.role === 'admin'});
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