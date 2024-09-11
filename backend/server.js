const express=require('express');
const cors=require('cors');
const mongoose=require('mongoose');
const bodyparser=require('body-parser');
const passport=require('passport');

require('dotenv').config();
const router = require('express').Router();

const app=express();
const port=process.env.PORT|| 5000;

app.use(cors());
app.use(bodyparser.json());
app.use(passport.initialize());


require('./config/passport')(passport);

const uri=process.env.ATLAS_URI;
mongoose.connect(uri,{useNewUrlParser:true, useUnifiedTopology:true ,useFindAndModify: false });
const connection=mongoose.connection;
connection.once('open',()=>{
    console.log("Mongo database connection established successfully");
});


const usersRouter=require('./routes/users');
app.use('/api/users',usersRouter);

const vantageApiRouter=require('./routes/vantage-api.router');
app.use('/api/protected/vantage-api',passport.authenticate('jwt',{session:false}),vantageApiRouter);

const incomeRouter=require('./routes/transaction.router');
app.use('/api/protected/income',passport.authenticate('jwt',{session:false}),incomeRouter);


app.listen(port,()=>{
    console.log('Server is running on port: '+port);
});


