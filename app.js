const express = require('express')
const Connect = require('./config/server')
const userRouter = require('./Router/userRoute')
const productRouter = require('./Router/ProductRoute')
const categoryRouter = require('./Router/catagoryRoute')
const subCategoryRouter = require('./Router/subcatagoryRoute')
const cartRouter = require('./routes/cartRoute')

const app = express()
require('dotenv').config()

const port = process.env.port||3000
const  cors=require("cors")

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json())
app.use('/user',userRouter)
app.use('/product',productRouter)
app.use('/catagory',categoryRouter)
app.use('/subcatagory',subCategoryRouter)
app.use('/cart', cartRouter)


app.listen(port, () => {
    Connect()
    console.log(` app listening on port ${port}!`)
}  
)