const express = require('express')
const userService = require('../services/user.service')

const router = express.Router()

router.post('/authenticate', authenticate)
router.post('/register', register)
router.get('/', getAll)
router.get('/:id', getById)

function register(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.send({ message: 'registed user successfully' }))
    .catch(err => next(err))
}

function getAll(req, res, next) {
  userService
    .getAllService()
    .then(users => res.json(users))
    .catch(err => next(err))
}

function getById(req, res, next) {
  userService
    .getByIdService(req.params.id)
    .then(user => (user ? res.json(user) : res.sendStatus(404)))
    .catch(err => next(err))
}

function authenticate(req, res, next) {
  console.log(req.sessionID, 'req')
  userService
    .authenticateService(req.body)
    .then(user =>
      user
        ? res.json(user)
        : res.status(400).json({ message: 'Username or password is incorrect' })
    )
    .catch(err => next(err))
}

module.exports = router
