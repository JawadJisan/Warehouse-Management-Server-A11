const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config()
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

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
    const inventoryCollection = client.db('inventoriesdb').collection('stocks');
    const deleveryCollection = client.db('inventoriesdb').collection('deleveredStocks');



    app.post('/login', (req, res) =>{
      const email = req.body;
      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
      res.send({token});
    })



    app.get('/inventories', async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories)
    })


    // (find one document) 
    // app.get('/inventories/:id'), async (req, res)=>{
    //   const id = req.params.id;
    //   const query = {_id: ObjectId(id)}
    //   const inventory = await inventoryCollection.findOne(query);
    //   res.send(inventory)
    // }
    // console.log('single document finded')

    /// find single document
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const service = await inventoryCollection.findOne(query);
      res.send(service)


      // Delet Inventories:
      // app.delete('/inventory/:id', async (req, res) => {
      //   const id = req.params.id;
      //   const query = { _id: ObjectId(id) }
      //   const result = await inventoryCollection.deleteOne(query);
      //   res.send(result);
      // })
      app.delete('/service/:id', async(req, res)=>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await inventoryCollection.deleteOne(query);
        res.send(result);
    });

    app.post('/delivered', async (req, res) =>{
      const orderInfo = req.body;
      const result = await deleveryCollection.insertOne(orderInfo);
      res.send({success: 'Inventory Delevered'})
    });
    

      // add new stocks to mongodb
      app.post('/addInventories', async (req, res)=>{
        const newInventories = req.body;
        const tokenInfo = req.headers.authorization;
        const [email, accessToken] = tokenInfo.split(" ")
        const decoded = verifyToken(accessToken);
        if(email === decoded.email){
          const result = await inventoryCollection.insertOne(newInventories);
          res.send({result});
        }
        else{
          res.send({success: "Unauthoraized Access"})
        }
      })

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

function verifyToken(token) {
  let email;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
    if(err){
      email = 'Invalid Email'
    }
    if(decoded){
      console.log(decoded)
      email = decoded;
    }
  });
  return email;
}