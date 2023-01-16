const cookieParser = require("cookie-parser")
const jwt = require('jsonwebtoken')
const Redis = require('ioredis');
const fs = require('fs');
const redis = new Redis({
    host: 'redis-18684.c264.ap-south-1-1.ec2.cloud.redislabs.com',
    port: 18684,
    password: process.env.REDIS
});


const authenticate = async(req,res,next)=>{
    const token = cookieParser.JSONCookies('token')
    const isMember = await redis.sismember("token", token);
    if(isMember){
        res.send({"msg" : "Please try logging in"})
    }
    else{
        var decoded = jwt.verify(token, process.env.TOKEN);
        if(decoded){
            req.UserId = decoded.UserId
            next()
        }else{
            return res.send({"msg" : "Please try Logging in"})
        }
    }
        
    }



module.exports = {authenticate}