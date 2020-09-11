const express = require('express')
const User = require('../models/user')

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (err) {
    res.json({ message: err.message })
  }
})

router.get('/current', (req, res) => {
  if (req.user) {
    res.send(req.user)
  } else {
    res.send({})
  }
})

module.exports = router
