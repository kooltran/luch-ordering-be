const mongoose = require('mongoose')
const Schema = mongoose.Schema
const OrderDish = require('./orderDish')

const AllOrderDishesSchema = new Schema({
  date: [
    {
      type: Schema.Types.ObjectId,
      ref: OrderDish
    }
  ]
})

const AllOrderDishes = mongoose.model('AllOrderDishes', AllOrderDishesSchema)
module.exports = AllOrderDishes
