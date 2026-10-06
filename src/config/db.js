const mongoose=require("mongoose")
const connectDB=async ()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('MongoDB connected successfuly')
    } catch (error) {
        console.log('MongoDB connection faild',error.message)
        process.exit(1)
    }
}
module.exports=connectDB