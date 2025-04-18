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
ProfilePic :{
    type : String,
    default :"https://example.com/default-profile.jpg"
},
role :{
    type :String,
    eunm :['admin','Standard user', 'Organizer'],
    default : 'Standard user'
},
createdAt :{
    type: Date,
    default : ()=> Date.now()
},

profilePicture:{
    type :String
},

})

const User =mongoose.model('User',userSchema);
module.exports = User;