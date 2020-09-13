const express = require('express')
const OrderDish = require('../models/orderDish')
const Payment = require('../models/payment')
const MenuList = require('../models/menu')
const User = require('../models/user')

const router = express.Router()

router.get('/list', async (req, res) => {
  try {
    const currentDate = new Date().toDateString()

    const orderList = await OrderDish.find({
      date: currentDate
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
      date: currentDate
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
      data: orders
    })
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/delete', async (req, res) => {
  try {
    const dishId = req.body._id

    const deletedOrder = await OrderDish.findByIdAndDelete(dishId)

    return res.send({
      message: 'Your order was remove successfully',
      data: deletedOrder
    })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

router.post('/check-paid', async (req, res) => {
  try {
    const orderId = req.body.id
    const isPaid = req.body.isPaid

    await OrderDish.findOneAndUpdate(
      { _id: orderId },
      { paid: isPaid },
      { upsert: true }
    )

    return res.send({
      message: 'Your order was update successfully'
    })
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

    return res.send({
      message: 'Your order was update successfully'
    })
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
          { orders: orderListByDate[date] },
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
          model: MenuList
        },
        {
          path: 'user',
          model: User
        }
      ]
    })

    res.json(payment)
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
        _id: req.params.orderId
      },
      {
        $set: { dish_name: req.body.dish_name }
      }
    )
    res.json(updatedOrder)
  } catch (error) {
    res.json({ message: error })
  }
})

module.exports = router
