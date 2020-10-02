const express = require('express')
const ordersServices = require('../services/orders.service')

const router = express.Router()

router.get('/list', async (req, res) => {
  try {
    const orderList = await ordersServices.getOrderList('current')

    res.json(orderList)
  } catch (err) {
    res.json({ message: err })
  }
})

router.get('/all', async (req, res) => {
  try {
    const orderList = await ordersServices.getOrderList('all')
    res.json(orderList)
  } catch (err) {
    res.json({ message: err })
  }
})

router.post('/create', async (req, res) => {
  try {
    const orders = await ordersServices.createOrderItem(req)

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
    const deletedOrder = await ordersServices.deleteOrderItem(req.body._id)

    return res.send(deletedOrder)
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
})

router.post('/check-paid', async (req, res) => {
  try {
    const orderListCheckedPaid = await ordersServices.checkPaid(req.body)
    res.send(orderListCheckedPaid)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/check-paid-provider', async (req, res) => {
  try {
    const payment = await ordersServices.checkPaidProvider(req.body)

    return res.send(payment)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.post('/paid-allweeks', async (req, res) => {
  try {
    const paymentUserPaid = await ordersServices.checkPaidAllWeek(req.body)

    return res.send(paymentUserPaid)
  } catch (err) {
    res.status(500).send(err)
  }
})

router.get('/payments', async (req, res) => {
  try {
    const payments = await ordersServices.getAllPayments(req.query)
    res.send(payments)
  } catch (error) {
    res.json({ message: error })
  }
})

router.get('/payment-by-week', async (req, res) => {
  try {
    const payments = await ordersServices.getPaymentByWeek(req.query)
    res.send(payments)
  } catch (error) {
    res.json({ message: error })
  }
})

module.exports = router
