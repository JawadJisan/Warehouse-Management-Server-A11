const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
const cors = require('cors')
require('dotenv').config()


const port = process.env.PORT || 5000;
app.use(cors())
app.use(express.json())

/* 
db:  inventoriesdb
collection: stocks
*/

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.M_DB_USER}:${process.env.M_DB_PASS}@cluster0.1ktnr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
  try {
    await client.connect();
    const inventoryCollection = client.db('inventoriesdb').collection('stocks');
    const deleveryCollection = client.db('inventoriesdb').collection('deleveredStocks');
    const partnersCollection = client.db('inventoriesdb').collection('partners');



    app.post("/login", (req, res) =>{
      const email = req.body;
      console.log('abc',email)

      const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);

      res.send({token});
    })


     // add new stocks to mongodb
     app.post('/addInventories', async (req, res)=>{
      const newInventories = req.body;
      
        const result = await inventoryCollection.insertOne(newInventories);
        res.send({ success: 'Product Upload Successfully' })
    })


    /* ** */
    app.get('/inventories', async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories)
    })

    /* ** */
    app.post('/delivered', async (req, res) =>{
      const orderInfo = req.body;
      const result = await deleveryCollection.insertOne(orderInfo);
      res.send({success: 'Inventory Delevered'})
    });


    /* JWF functions */
    function verifyJWT(req, res, next){
      const authHeader = req.headers.authorization;
      if(!authHeader){
        return res.status(401).send({message: 'UnAuthorized Access'});
      }
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.NEW_ACCESS_TOKEN, (err, decoded)=>{
        if(err){
          return res.status(403).send({message: 'Forbideen Access'});
        }
        console.log('decodec', decoded);
        req.decoded = decoded;
        next();
      })

    }



    ///* jwt *////
    app.post('/getToken', async(req, res)=>{
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.NEW_ACCESS_TOKEN,{
        expiresIn: '1d'
      });
      res.send({accessToken});
    })


      // get delivered using user email when user first register and then login >> then he will see his delivered items
      app.get('/getdelivered', verifyJWT, async (req, res)=>{
        const decodedEmail = req.decoded.email;
        const email = req.query.email;
       if(email === decodedEmail){
        const query = {email:email};
        const cursor = deleveryCollection.find(query);
        const inventories = await cursor.toArray();
        res.send(inventories)
       }
       else{
         res.status(403).send({message: "Forbidden Access"});
       }
      })

      
    // delivered using name
    app.post('/deliveredNAME', async (req, res) =>{
      const orderInfo = req.body;
      const result = await deleveryCollection.insertOne(orderInfo);
      res.send(result)
    });

    // get delivered using user email when user first register and then login >> then he will see his delivered items
    app.get('/getdeliveredNAME', verifyJWT, async (req, res)=>{
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
     if(email === decodedEmail){
      const query = {email:email};
      const cursor = deleveryCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories)
     }
     else{
       res.status(403).send({message: "Forbidden Access"});
     }
    })

    // get the partners
    /* ** */
    app.get('/partners', async (req, res)=>{
      const query = {};
      const cursor = partnersCollection.find(query);
      const partnersRevies = await cursor.toArray();
      res.send(partnersRevies)
    })


    app.get('/inventoriesDelevired', async (req, res)=>{
      const query = {};
      const cursor = deleveryCollection.find(query);
      const inventories = await cursor.toArray();
      res.send(inventories)
    })

    
    // get delivered in specific users
    app.get("/myItems", async(req, res) =>{
      const tokenInfo = req.headers.authorization;

      console.log('GET DELIVERED ITEMS CONSOLE TOKEN',tokenInfo);
      const [email, accessToken] = tokenInfo.split(" ")
      console.log(email, accessToken)

      const decoded = verifyToken(accessToken)
      if(email === decoded.email) {
        const deleveredStocks = await deleveryCollection.find({email:email}).toArray();
        res.send(deleveredStocks);
      }
      else{
        res.send({success : 'Unauth Access'});
      }
    })

    /* -------------- */
    app.get("/myCollectedStocks", async(req, res) =>{
        const deleveredStocks = await deleveryCollection.find({}).toArray();
        res.send(deleveredStocks);
    })


    // delet
    app.delete('/myItems/:id',async(req, res)=>{
      const id= req.params.id;
      const filter = { _id: ObjectId(id)};
      const result = await deleveryCollection.deleteOne(filter);
      res.send(result);



  })

    // update 
    app.put('/inventorie/:id',async (req, res)=>{
      const id = req.params.id;
      const data = req.body;
      console.log('from put' ,data);
      const filter = { _id: ObjectId(id)};
      const options = { upsert: true };
      const updateDoc = {
          $set: {
            name: data.name, 
            quantity : data.quantity

          },
        };
      const result = await inventoryCollection.updateOne(filter, updateDoc, options);
      res.send(result);




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
  console.log(`Example app listening on new port ${port}`)
})
