const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

//middleware

app.use(cors());
// app.use(express.json());

const categories = require('./data/Categories.json')

app.get('/', (req, res) => {
    res.send('assignment 12 server is running')
});

app.get('/product-categories', (req, res) => {
    res.send(categories);
})

app.listen(port, () => {
    console.log(`assignment 12 server running on port ${port}`)
})