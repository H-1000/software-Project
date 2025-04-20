const mongoose = require('mongoose');


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
    eunm :['admin','user', 'organizer'],
    default : 'user',
    required : true
},
createdAt :{
    type: Date,
    default : ()=> Date.now()
},

profilePicture:{
    type :String
},

})

const user =mongoose.model('user',userSchema);
module.exports = user;