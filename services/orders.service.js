const OrderDish = require('../models/orderDish')
const Payment = require('../models/payment')
const MenuList = require('../models/menu')
const User = require('../models/user')
const PaymentUser = require('../models/paymentByUser')
const dayjs = require('dayjs')

const weekOfYear = require('dayjs/plugin/weekOfYear')
dayjs.extend(weekOfYear)

exports.createOrderItem = async req => {
  const dishes = req.body
  const userId = req.user._id
  const currentDate = dishes[0].date

  const currentDishes = await OrderDish.find({
    user: userId,
    date: currentDate
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
          extraDish: extraDish
        },
        {
          quantity,
          date,
          dish: dishId,
          createdAt,
          week,
          extraDish
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
      date: currentDate
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

// exports.checkPaidProvider = async params => {
//   const { id, isPaid, week } = params
//   const startDate = helper.getStartDate(week)
//   const endDate = helper.getEndDate(week)

//   await Payment.findOneAndUpdate(
//     { _id: id },
//     { isPaid: isPaid },
//     { upsert: true }
//   )

//   return await Payment.find({
//     createdAt: { $gte: startDate, $lt: endDate },
//   }).populate({
//     path: 'orders',
//     model: OrderDish,
//     populate: [
//       {
//         path: 'dish',
//         model: MenuList,
//       },
//       {
//         path: 'user',
//         model: User,
//       },
//     ],
//   })
// }

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

exports.getAllPayments = async query => {
  const { type = 'date' } = query

  if (type === 'date') {
    const orderList = await OrderDish.find()
    const orderListByDate = orderList.reduce((acc, order) => {
      const key = order['date']
      acc[key] = acc[key] || []
      acc[key].push(order)
      return acc
    }, {})

    await Promise.all(
      Object.keys(orderListByDate).map(async date => {
        const orders = orderListByDate[date]
        return await Payment.findOneAndUpdate(
          { createdAt: dayjs(new Date(date)) },
          { orders: orders },
          { upsert: true }
        )
      })
    )

    return await Payment.find().populate({
      path: 'orders',
      model: OrderDish,
      populate: [
        {
          path: 'dish',
          model: MenuList
        },
        {
          path: 'user',
          model: User
        }
      ]
    })
  } else {
    const orderList = await OrderDish.find()

    const orderListFomatted = orderList.map(order => ({
      id: order._id,
      date: order.date,
      dish: { name: order.dish.name, price: order.dish.price },
      quantity: order.quantity,
      user: order.user._id
    }))

    const orderListByUser = orderListFomatted.reduce((acc, order) => {
      const key = order['user']
      acc[key] = acc[key] || []
      acc[key].push(order)
      return acc
    }, {})

    await Promise.all(
      Object.keys(orderListByUser).map(async user => {
        const orders = orderListByUser[user].map(item => item.id)

        await PaymentUser.findOneAndUpdate(
          { user: user },
          { orders: orders },
          { upsert: true }
        )
      })
    )

    return await PaymentUser.find().populate({
      path: 'orders',
      model: OrderDish,
      populate: [
        {
          path: 'dish',
          model: MenuList
        },
        {
          path: 'user',
          model: User
        }
      ]
    })
  }
}

exports.getPaymentByWeek = async query => {
  const { week } = query
  const orderList = await OrderDish.find({ week: week })
    .sort({ createdAt: 'desc' })
    .populate('dish user')

  return orderList
}
