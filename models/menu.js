const mongoose = require('mongoose')
const Schema = mongoose.Schema

const menuListSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  price: {
    type: String,
    required: true
  }
})

const MenuList = mongoose.model('MenuList', menuListSchema)

module.exports = MenuList
