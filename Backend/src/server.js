const { app } = require("./app")
const { connectDB } = require("./config/db")
const dotenv = require('dotenv')
dotenv.config()

const PORT = process.env.PORT || 4000


app.listen(PORT, async() => {
    await connectDB()
    console.log('server is running on  port ', PORT)
})

