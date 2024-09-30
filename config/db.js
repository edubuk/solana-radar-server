import mongoose  from 'mongoose';


const connectDB = async()=>{
    try {
        await mongoose.connect("mongodb+srv://edubuk:Ok6Bl6dGYkCoqY9a@edubuk.kvlhn.mongodb.net/?retryWrites=true&w=majority&appName=Edubuk" )
        console.log('Connected to MongoDB database');
    } catch (error) {
        console.log('Error in mongoDB' );
    }
}

export default connectDB;