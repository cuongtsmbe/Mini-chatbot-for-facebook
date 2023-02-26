var mongoose = require("mongoose");

//create schema
//fbid is id of facebook 
//active if 0 == turn off AI else 1 == turn on AI
var UserSchema = new mongoose.Schema({
    fbid:{ type: String, required: true ,unique:true },
    active: { 
        type: Number,
        required: true,
        min: 0,
        max: 1,
        default : 1
    },
});

//model 
var User = mongoose.model("Users", UserSchema);

module.exports = User;
