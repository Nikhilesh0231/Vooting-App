const express = require('express');
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser');
app.use(bodyParser.json());//all data is stored req.body 
const PORT = process.env.PORT||3000


//Import the routers file 
const userRoutes = require('./routes/userRoutes.js');
const candidateRoutes = require('./routes/candidateRoutes.js');
//Use the router file
app.use('/user',userRoutes);
app.use('/candidate',candidateRoutes);

app.listen(PORT, () => {
  console.log('server is running on port 3000');
}) 