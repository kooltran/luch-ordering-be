const express = require('express')
const OrderDish = require('../models/orderDish')

const router = express.Router()

router.get('/list', async (req, res) => {
  try {
    const orderList = await OrderDish.find()
    const orderListRes = orderList.filter(order => {
      const orderDate = new Date(order.date).toDateString()
      const currentDate = new Date().toDateString()
      return orderDate === currentDate
    })
    res.json(orderListRes)
  } catch (err) {
    res.json({ message: err })
  }
})

router.get('/all', async (req, res) => {
  try {
    const orderList = await OrderDish.find()
    res.json(orderList)
  } catch (err) {
    res.json({ message: err })
  }
})

router.post('/create', async (req, res) => {
  try {
    const orders = await OrderDish.insertMany(req.body)
    // const curList = await OrderDish.find()
    // if (curList.length === 0) {
    //   await OrderDish.insertMany(req.body)
    // } else {
    //   const orderList = req.body
    //   const updatedList = []
    //   curList.forEach((item, index) => {
    //     const orderItem = orderList[index]
    //     if (
    //       orderItem &&
    //       orderItem.name === item.name &&
    //       orderItem.date === item.date
    //     ) {
    //       console.log(orderItem, 'orderItem')
    //       updatedList.push(orderItem)
    //     }

    //     if (
    //       orderItem &&
    //       orderItem.name !== item.name &&
    //       orderItem.date !== item.date
    //     ) {
    //       updatedList.push(orderItem)
    //     }
    //     // console.log(item, 'item')
    //     // console.log(orderItem, 'orderItem')
    //   })
    //   console.log('============')
    //   console.log([...curList, ...updatedList], 'list')
    //   // await OrderDish.insertMany([...curList, ...updatedList])
    // }

    return res.send({
      message: 'Created new order successfully',
      data: orders,
    })
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
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
