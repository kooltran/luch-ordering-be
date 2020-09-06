const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("./user");
const Dish = require("./menu");

// const orderSchema = new Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   dish_name: {
//     type: String,
//     required: true,
//   },
//   date: {
//     type: String,
//     required: true,
//   },
//   quantity: {
//     type: Number,
//     required: true,
//   },
//   price: {
//     type: Number,
//     required: true,
//   },
// })

const orderSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: User
  },
  dish: {
    type: Schema.Types.ObjectId,
    ref: Dish
  },
  date: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  paid: {
    type: Boolean
  }
});

const OrderDish = mongoose.model("OrderDish", orderSchema);

module.exports = OrderDish;
