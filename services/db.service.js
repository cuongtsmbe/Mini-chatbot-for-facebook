const mongoose = require('mongoose');
require('dotenv').config();

module.exports = {
  //connect to mongodb
  connect:  function() {
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI);
  }

};
