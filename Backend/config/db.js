const mongoose = require("mongoose")
const env = require('dotenv')
env.config()
const connection = mongoose.connect(process.env.MONGO_URL)

module.exports = {connection}