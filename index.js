const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors())
app.use(express.json())

/* 
db:  inventoriesdb
collection: stocks
*/

const uri = `mongodb+srv://${process.env.M_DB_USER}:${process.env.M_DB_PASS}@cluster0.1ktnr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
        const inventoryCollection = client.db('inventoriesdb').collection('stocks')

      const query = {};
        app.get('/inventories', async(req, res)=>{
        const inventories = await inventoryCollection.find({}).toArray();
        res.send(inventories)
        })

    } 
    finally {

    }
  }
  run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World! I missed the Batch Ifter party Because of This Assignment?? But what allah done is the best for me?? Happy Coding')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })