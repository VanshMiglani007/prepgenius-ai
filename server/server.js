const express = require("express")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

console.log("Mongo URI:", process.env.MONGO_URI)

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err))

const authRoutes = require("./routes/authRoutes")
app.use("/api/auth", authRoutes)

app.get("/", (req,res)=>{
    res.send("PrepGenius API Running")
})

app.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`)
})