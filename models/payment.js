const mongoose = require('mongoose')
const Schema = mongoose.Schema
const Orders = require('./orderDish')

const PaymentSchema = new Schema({
  id: String,
  orders: [{ type: Schema.Types.ObjectId, ref: Orders }],
  isPaid: { type: Boolean, default: false },
  createdAt: { type: Date },
})

const Payment = mongoose.model('Payment', PaymentSchema)
module.exports = Payment
