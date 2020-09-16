const express = require('express')
const OrderDish = require('../models/orderDish')
const Payment = require('../models/payment')
const MenuList = require('../models/menu')
const User = require('../models/user')
const PaymentUser = require('../models/paymentByUser')

const router = express.Router()

router.get('/list', async (req, res) => {
  try {
    const currentDate = new Date().toDateString()

    const orderList = await OrderDish.find({
      date: currentDate,
    }).populate('dish user')

    res.json(orderList)
  } catch (err) {
    res.json({ message: err })
  }
})

router.get('/all', async (req, res) => {
  try {
    const orderList = await OrderDish.find().populate('dish user')
    res.json(orderList)
  } catch (err) {
    res.json({ message: err })
  }
})

router.post('/create', async (req, res) => {
  try {
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

    const orders = await Promise.all(
      dishes.map(dish => {
        const { quantity, date, dishId, paid } = dish
        return OrderDish.findOneAndUpdate(
          { user: userId, date: dish.date, dish: dishId, paid },
          { quantity, date, dish: dishId, date: dish.date },
          { upsert: true, new: true }
        ).populate('dish user')
      })
    )

    return res.send({
      message: 'Created new order successfully',
      data: orders,
    })
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/delete', async (req, res) => {
  try {
    const dishId = req.body._id

    const deletedOrder = await OrderDish.findByIdAndDelete(dishId)

    return res.send(deletedOrder)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

router.post('/check-paid', async (req, res) => {
  try {
    const { id, isPaid, isDateMode } = req.body

    await OrderDish.findOneAndUpdate(
      { _id: id },
      { paid: isPaid },
      { upsert: true }
    )

    const orderList = await OrderDish.find().populate('dish user')

    return res.send(orderList)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/check-paid-provider', async (req, res) => {
  try {
    const orderPaymentId = req.body.id
    const isPaid = req.body.isPaid

    await Payment.findOneAndUpdate(
      { _id: orderPaymentId },
      { isPaid: isPaid },
      { upsert: true }
    )

    const payment = await Payment.find().populate({
      path: 'orders',
      model: OrderDish,
      populate: [
        {
          path: 'dish',
          model: MenuList,
        },
        {
          path: 'user',
          model: User,
        },
      ],
    })

    return res.send(payment)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/paid-allweeks', async (req, res) => {
  try {
    const { id, isPaidAllWeek, userId } = req.body

    const orderList = await OrderDish.find().populate('dish user')

    const orderListByUserPaid = orderList.filter(
      order => order.user._id.toString() === userId
    )

    const orderListFomatted = orderListByUserPaid.map(order => ({
      id: order._id,
      dish: order.dish,
      paid: isPaidAllWeek,
      quantity: order.quantity,
      user: order.user,
    }))

    const orderListByUserPaidRes = orderListFomatted.map(order => order.id)

    await PaymentUser.findOneAndUpdate(
      { _id: id },
      { orders: orderListByUserPaidRes, isPaid: isPaidAllWeek },
      { upsert: true }
    )

    const paymentUser = await PaymentUser.find().populate({
      path: 'orders',
      model: OrderDish,
      populate: [
        {
          path: 'dish',
          model: MenuList,
        },
        {
          path: 'user',
          model: User,
        },
      ],
    })
    console.log(paymentUser, 'paymentUser')
    return res.send(paymentUser)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/payment', async (req, res) => {
  try {
    const orderList = await OrderDish.find().populate('dish user')
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
          { createdAt: date },
          { orders: orders },
          { upsert: true }
        )
      })
    )
    const payment = await Payment.find().populate({
      path: 'orders',
      model: OrderDish,
      populate: [
        {
          path: 'dish',
          model: MenuList,
        },
        {
          path: 'user',
          model: User,
        },
      ],
    })

    res.json(payment)
  } catch (error) {
    res.json({ message: error })
  }
})

router.get('/payment-by-user', async (req, res) => {
  try {
    const orderList = await OrderDish.find().populate('dish user')
    const orderListFomatted = orderList.map(order => ({
      id: order._id,
      date: order.date,
      dish: { name: order.dish.name, price: order.dish.price },
      quantity: order.quantity,
      user: order.user._id,
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
    const paymentByUser = await PaymentUser.find().populate({
      path: 'orders',
      model: OrderDish,
      populate: [
        {
          path: 'dish',
          model: MenuList,
        },
        {
          path: 'user',
          model: User,
        },
      ],
    })

    res.json(paymentByUser)
  } catch (error) {
    res.json({ message: error })
  }
})

router.delete('/:orderId', async (req, res) => {
  try {
    const removedOrder = await OrderDish.remove({ _id: req.params.orderId })
    res.json(removedOrder)
  } catch (error) {
    res.json({ message: error })
  }
})

router.patch('/:orderId', async (req, res) => {
  try {
    const updatedOrder = await OrderDish.updateOne(
      {
        _id: req.params.orderId,
      },
      {
        $set: { dish_name: req.body.dish_name },
      }
    )
    res.json(updatedOrder)
  } catch (error) {
    res.json({ message: error })
  }
})

module.exports = router
