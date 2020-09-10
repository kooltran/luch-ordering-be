const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Orders = require("./orderDish");

const PaymentSchema = new Schema({
  id: string,
  orders: [{ type: Schema.Types.ObjectId, ref: Orders }],
  isPaid: boolean
});

const Payment = mongoose.model("Payment", PaymentSchema);
module.exports = Payment;
