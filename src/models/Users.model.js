import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: { 
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    avatar: {
        type: String,
        required: true,
    },
    coverImage: {
        type: String,
    },
    watchHistory: { // Ensure that "Video" collection exists
        type: Schema.Types.ObjectId,
        ref: 'Video', // Removed extra space
    },
    password: {
        type: String,
        required: [true, 'Password is required'], // Changed semicolon to comma
    },
}, { timestamps: true });




//The schema.pre function in Mongoose defines middleware that executes before a specified operation (such as save, update, or remove) on a document, allowing for pre-processing or validation.
userSchema.pre("save", async function(next){
    if(!this.isModified('password')){
        next()
    }
    try {
        const salt  =  await bcrypt.genSalt(10)
        this.password = await  bcrypt.hash(this.password, salt);
        next()
        
    } catch (error) {
        next(error)
    }
})


// userSchema.methods.isPasswordCorrect = async function(password){
//     return await bcrypt.compare(password, this.password)
// }

//schema.methods  is used to difine your custom function in mongoose 
userSchema.methods.isPasswordCorrect = async function(password) {
    try {
      return await bcrypt.compare(password, this.password);
    } catch (error) {
      throw new Error('Error comparing passwords');
    }
  };

  userSchema.methods.generateAccessToken = async function(){
    jwt.sign({
        _id : this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
   process.env.ACCESS_TOKEN_SECRET,
   {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    
   }
)}



//The jwt.sign() function generates a JSON Web Token (JWT) by encoding a payload with a secret key and optional configuration options, producing a token that can be used for secure communication and authentication.





userSchema.methods.generateRefreshToken = async function(){
    jwt.sign({
        _id: this._id
    },

    process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
)
}



  



export const User = mongoose.model('User', userSchema);
