const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const config = require('../config')

async function authenticateService({ email, password }) {
  const user = await User.findOne({ email })
  if (user && bcrypt.compareSync(password, user.password)) {
    // const token = jwt.sign({ sub: user.id }, config.secret, { expiresIn: '7d' })
    return {
      ...user.toJSON()
      // token
    }
  }
}

async function getAllService() {
  return await User.find()
}

async function getByIdService(id) {
  return await User.findById(id)
}

async function create(userParam) {
  console.log(userParam, 'userParam')
  // validate
  if (await User.findOne({ email: userParam.email })) {
    // eslint-disable-next-line no-throw-literal
    throw 'Email "' + userParam.email + '" is already taken'
  }

  // hash password
  if (userParam.password) {
    const hashPass = bcrypt.hashSync(userParam.password, 10)
    const user = new User({
      email: userParam.email,
      username: userParam.username,
      roles: userParam.roles,
      createdDate: userParam.createdDate,
      password: hashPass
    })
    // save user
    await user.save()
  }
}

module.exports = {
  authenticateService,
  getAllService,
  getByIdService,
  create
}
