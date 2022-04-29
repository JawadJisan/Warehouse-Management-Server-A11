const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
require('dotenv').config()


app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
    res.send('Hello World! I missed the Batch Ifter party Because of This Assignment?? But what allah done is the best for me?? Happy Coding')
  })
  
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })