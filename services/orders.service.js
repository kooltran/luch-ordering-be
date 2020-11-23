const OrderDish = require('../models/orderDish')
const dayjs = require('dayjs')

const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)

exports.createOrderItem = async req => {
  const dishes = req.body
  const userId = req.user._id
  const currentDate = dishes[0].date

  const currentDishes = await OrderDish.find({
    user: userId,
    date: currentDate,
  })

  await Promise.all(
    currentDishes.map(dish => OrderDish.findByIdAndDelete(dish.id))
  )

  return await Promise.all(
    dishes.map(dish => {
      const { quantity, date, dishId, paid, createdAt, week, extraDish } = dish
      return OrderDish.findOneAndUpdate(
        {
          user: userId,
          date: dish.date,
          dish: dishId,
          paid,
          extraDish: extraDish,
        },
        {
          quantity,
          date,
          dish: dishId,
          createdAt,
          week,
          extraDish,
        },
        { upsert: true, new: true }
      ).populate('dish user')
    })
  )
}

exports.getOrderList = async type => {
  if (type === 'all') {
    return await OrderDish.find().populate('dish user')
  } else {
    const currentDate = new Date().toDateString()

    return await OrderDish.find({
      date: currentDate,
    }).populate('dish user')
  }
}

exports.deleteOrderItem = async dishId => {
  return await OrderDish.findByIdAndDelete(dishId)
}

exports.checkPaid = async params => {
  const { id, isPaid, week } = params

  await OrderDish.findOneAndUpdate(
    { _id: id },
    { paid: isPaid },
    { upsert: true }
  )

  return OrderDish.find({ week: week })
    .sort({ createdAt: 'desc' })
    .populate('dish user')
}

exports.updateOrder = async params => {
  const { orderId, editedDishId, editedUserId } = params

  const updatedOrder = await OrderDish.findByIdAndUpdate(
    orderId,
    {
      user: editedUserId,
      dish: editedDishId,
    },
    { new: true }
  ).populate('dish user')

  return updatedOrder
}

exports.checkPaidAllWeek = async params => {
  const { id, isPaidAllWeek, week } = params

  await OrderDish.updateMany(
    { week: week, user: id },
    { paid: isPaidAllWeek },
    { upsert: true }
  )

  return await OrderDish.find({ week: week })
    .sort({ createdAt: 'desc' })
    .populate('dish user')
}

exports.getPaymentByWeek = async query => {
  const { week } = query
  const orderList = await OrderDish.find({ week: week })
    .sort({ createdAt: 'desc' })
    .populate('dish user')

  return orderList
}
