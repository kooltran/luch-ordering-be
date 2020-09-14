const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Orders = require('./orderDish')
const User = require('./user')

const PaymentUserSchema = new Schema({
  user: String,
  id: String,
  orders: [{ type: Schema.Types.ObjectId, ref: Orders }],
  isPaid: { type: Boolean, default: false }
})

const PaymentUser = mongoose.model('PaymentUser', PaymentUserSchema)
module.exports = PaymentUser
