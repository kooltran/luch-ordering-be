const express = require('express')
const OrderDish = require('../models/orderDish')
const Payment = require('../models/payment')
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

// router.get('/get-all-orders', async (req, res) => {
//   try {
//     const orderList = await OrderDish.find().populate('dish, user')
//     const orderListByDate = orderList.reduce((acc, order) => {
//       const key = order['date']
//       console.log(acc[key]['data'])
//       if (acc[key].data) {
//         acc[key]['data'] = acc[key]['data'] || []
//         // acc[key].data.push(order)
//       }
//       return acc
//     }, {})
//     console.log(orderListByDate, 'orderListByDate')
//     new AllOrderDishes(orderListByDate).save()
//     res.json(orderList)
//   } catch (err) {
//     res.json({ message: err })
//   }
// })

// router.post('/paid-provider', async (req, res) => {
//   try {
//     const chosenDate = req.body.date
//     const orderList = await OrderDish.find({ date: chosenDate })
//     console.log(orderList)
//   } catch (error) {
//     res.json({ message: err })
//   }
// })

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
    // console.log(orders, 'orders')
    // const record = await Payment.findOne({orders})
    // const payment = await Promise.all(
    //   orders.map(order => {
    //     return Payment.findOneAndUpdate(
    //       { createdAt: currentDate },
    //       { orders: [order] },
    //       { upsert: true }
    //     ).populate('dish user')
    //   })
    // )
    // console.log(payment, 'payment')

    // await Payment.findOneAndUpdate(
    //   { createdAt: currentDate },
    //   { orders: orders },
    //   { upsert: true }
    // ).populate('dish user')

    return res.send({
      message: 'Created new order successfully',
      data: orders
    })
  } catch (err) {
    console.log(err)
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
    const rest = await OrderDish.findOneAndUpdate(
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

// router.post("/create", async (req, res) => {
//   try {
//     const orders = await OrderDish.insertMany(req.body);
//     const curList = await OrderDish.find();
//     if (curList.length === 0) {
//       await OrderDish.insertMany(req.body);
//     } else {
//       const orderList = req.body;
//       const updatedList = [];
//       curList.forEach((item, index) => {
//         const orderItem = orderList[index];
//         if (
//           orderItem &&
//           orderItem.name === item.name &&
//           orderItem.date === item.date
//         ) {
//           console.log(orderItem, "orderItem");
//           updatedList.push(orderItem);
//         }

//         if (
//           orderItem &&
//           orderItem.name !== item.name &&
//           orderItem.date !== item.date
//         ) {
//           updatedList.push(orderItem);
//         }
//         // console.log(item, 'item')
//         // console.log(orderItem, 'orderItem')
//       });
//       console.log("============");
//       console.log([...curList, ...updatedList], "list");
//       // await OrderDish.insertMany([...curList, ...updatedList])
//     }

//     return res.send({
//       message: "Created new order successfully",
//       data: orders
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).send(err);
//   }
// });

router.get('/payment', async (req, res) => {
  try {
    const orderList = await OrderDish.find().populate('dish user')
    const orderListByDate = orderList.reduce((acc, order) => {
      const key = order['date']
      acc[key] = acc[key] || []
      acc[key].push(order)
      return acc
    }, {})

    // const allUser = await User.find()
    // const findUserByName = userId =>
    //   allUser.find(user => parseInt(user._id) === parseInt(userId))

    await Promise.all(
      Object.keys(orderListByDate).map(async date => {
        const orders = orderListByDate[date]
        console.log(orders, 'orders')
        return await Payment.findOneAndUpdate(
          { createdAt: date },
          { orders: orderListByDate[date] },
          { upsert: true }
        )
      })
    )
    const payment = await Payment.find().populate('orders')
    payment.map(item => console.log(item.orders))
    console.log(payment, 'payment')
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
