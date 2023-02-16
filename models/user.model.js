var mongoose = require("mongoose");

//create schema
var UserSchema = new mongoose.Schema({
    fbid:{ type: String, required: true ,unique:true },
    
});

//model 
var User = mongoose.model("Users", UserSchema);

module.exports = User;
