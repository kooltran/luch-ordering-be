const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
  username: String,
  googleId: String,
  avatar: String,
  roles: Array,
})

const User = mongoose.model('User', UserSchema)
module.exports = User
