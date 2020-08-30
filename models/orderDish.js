const mongoose = require('mongoose')
const Schema = mongoose.Schema

const orderSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  dish_name: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  }
})

const OrderDish = mongoose.model('OrderDish', orderSchema)

module.exports = OrderDish
