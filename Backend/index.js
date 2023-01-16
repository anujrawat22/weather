const express = require("express")
const  env  = require("dotenv")
const { connection } = require("./config/db")
const {UserModel} = require("./models/user.model")
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
var cookieParser = require('cookie-parser')
const Redis = require('ioredis');
const {authenticate} = require("./middleware/authentication")
const fs = require('fs');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


const redis = new Redis({
    host: 'redis-18684.c264.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 18684,
    password: process.env.REDIS
});

env.config()
const app = express()

app.use(express.json())


app.get("/",(req,res)=>{
    res.send("hello")
})

app.post('/signup',async(req,res)=>{
    console.log(req.body)
    const {name,email,password,age} = req.body

    const finduser = await UserModel.findOne({email})
    if(finduser){
       return res.status(401).send({'msg' : "User already exists,try logging in"})
    }else{
        bcrypt.hash(password, 5,async function(err, hash) {
            if(err){
                console.log("Something went wrong")
               return res.send({'msg' : 'something went wrong',"Error" :err})
            }else{
                const user =await new UserModel({name,email,password : hash,age})
                user.save()
                return res.status(200).send({'msg' : "Signed up sucessfully"})
            }
        });
    }
})


app.post("/login",async(req,res)=>{
    const {email,password} = req.body
    const user = await UserModel.findOne({email})
    
    if(user){
        const hashedpassword = user.password
        bcrypt.compare(password, hashedpassword, function(err, result) {
           if(err){
            console.log("Something went wrong")
            return res.status(401).send({"msg" : "Something went wrong","error" : err})
           }else{
            if(result){
                jwt.sign({ UserId: user._id }, process.env.TOKEN, {expiresIn : 60*60*24*7}, function(err, token) {
                    if(err){
                        console.log("Something went wrong")
                        return res.status(401).send({"msg" : "Something went wrong"})
                    }else{
                        res.cookie('token',`${token}`)
                        return res.status(200).send({"msg" : "Logged in sucessfully" , "token" : token})
                    }
                  });
            }else{
                return res.send({"msg" : "Invalid credentials"})
            }
           }
        });
    }
})


app.post("/weatherdata",async(req,res)=>{
    const {city} = req.body
     const response = await fetch(`http://api.weatherapi.com/v1?key=${process.env.WEATHERKEY}&q=${city}&days=1&dt=2023-01-16`)
     console.log(response)

})


app.get('/logout',async (req,res)=>{
    const token = req.headers?.authorization?.split(" ")[1]
    await redis.sadd("token", token);
    res.send({"msg" : "Logged Out sucessfully"})
})

app.listen(process.env.PORT,async()=>{

    try{
        await connection
        console.log("Connected to DB")
    }
    catch(err){
        console.log("Error connecting to DB")
        console.log(err)
    }
    console.log(process.env.PORT)
})