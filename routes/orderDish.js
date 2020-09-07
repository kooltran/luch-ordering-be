const express = require('express')
const OrderDish = require('../models/orderDish')

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
          { quantity, date, dish: dishId },
          { upsert: true, new: true }
        ).populate('dish user')
      })
    )

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
