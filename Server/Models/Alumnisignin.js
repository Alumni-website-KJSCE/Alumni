const mongoose=require('mongoose');

const AlumniSchema=new mongoose.Schema({
    email: String,
    password: String
})

const Alumnisignin=mongoose.model('Alumni', AlumniSchema);
module.exports=Alumnisignin;