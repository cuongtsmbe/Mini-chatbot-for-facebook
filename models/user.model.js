const schema = new mongoose.Schema({
    fbID: String
});
  
const User = mongoose.model('User', schema);
  
module.exports = User;