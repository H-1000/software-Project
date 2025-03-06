const mongoose = require('mongoose');
const { type } = require('os');

const userSchema=new mongoose.Schema({
name :{
    type : String ,
    required : true 
},
email :{
    type : String ,
    required : true ,
    unique :true
},
password:{
    type :String,
    required :true
},
role :{
    type :String,
    eunm :['System admin','Standard user', 'Organizer'],
    default : 'Standard user'
},
createdAt :{
    type: Date,
    default : ()=> Date.now()
}

})

const User =mongoose.model('User',userSchema);
model.exports = User;