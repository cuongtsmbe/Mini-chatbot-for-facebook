const UserModel =require('../models/user.model');

module.exports = {  
  //add new id contact (fb)
  addUser:function(ID){
    var myData = new UserModel({
      fbid:ID
    });

    myData.save()
      .then(item => {
        console.log("--add new user success--");
          console.log(item);
      })
      .catch(err => {
          console.log(err);
    });

  },

  //add new user
  addNewUser:function(fbid){
    let userNew = new UserModel({fbid});
    return userNew.save();
  },

  //get user by FBid . IF don't have fbid then create it
  //return promise
  getUserByFbID:async function(fbid){
    let user = await UserModel.findOne({
      fbid,
    }).exec();
    if (!user) {
      user = this.addNewUser(fbid);
    }
    return user;
  },

  //delete user have fbid
  //return promise
  deleteUserByFbID: async function(fbid) {
    const delUser = await UserModel.deleteMany({ fbid }).exec();
    return delUser;
  }

};