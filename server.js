const dotenv = require('dotenv')
const mongoose = require('mongoose')
const express = require('express')
const puppeteer = require('puppeteer')
const bodyParser = require('body-parser')
const passport = require('passport')
const cookiesSession = require('cookie-session')
const path = require('path')
const session = require('express-session')
const authService = require('./services/auth.service')

const cors = require('cors')
dotenv.config()

const config = require('./config.json')

const MenuList = require('./models/menu')
const orderRoute = require('./routes/orderDish')

require('./passport-setup')

const NODE_ENV = process.env.NODE_ENV

const app = express()
const PORT = process.env.PORT || 3000
const db = mongoose.connection
const REDIRECT_AUTH_URL =
  NODE_ENV === 'development'
    ? process.env.REDIRECT_LINK_DEV
    : process.env.REDIRECT_LINK_PROD

const DB_URL =
  NODE_ENV === 'development' ? process.env.DEV_DB_URL : process.env.PROD_DB_URL

app.use(bodyParser.json())
app.use(
  cors({
    origin: '*',
    credentials: true
  })
)

app.all('*', function (req, res, next) {
  var origin = req.get('origin')
  res.header('Access-Control-Allow-Origin', origin)
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'X-Requested-With')
  res.header('Access-Control-Allow-Headers', 'Content-Type')
  res.header('Access-Control-Allow-Credentials', true)
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  )
  next()
})

const URL = 'https://www.anzi.com.vn/'

console.log(NODE_ENV)

mongoose
  .connect(process.env.PROD_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => console.log('DB connected'))
db.on('error', err => {
  console.log('DB connection error:', err.message)
})

const getMenuList = async () => {
  try {
    const brower = await puppeteer.launch()
    const page = await brower.newPage()
    await page.goto(URL)
    const existList = await MenuList.find()

    const menuList = await page.evaluate(() => {
      const items = document.querySelectorAll('#list_menu .item-menu')
      let menuInfo = []
      items.forEach((item = {}) => {
        console.log(item)
        const img = item.children[0].children[0].src
        const name = item.children[1].textContent.trim()
        const price = item.children[2].children[0].textContent.trim()
        menuInfo.push({ name, img, price })
      })
      return menuInfo
    })

    if (existList.length === 0) {
      MenuList.insertMany(menuList)
    } else {
      const newList = menuList.map((item, idx) => ({
        id: existList[idx]._id,
        name: item.name,
        img: item.img,
        price: item.price
      }))
      newList.map(async (item = {}) =>
        MenuList.updateOne({ _id: item.id }, item, { upsert: false })
      )
    }
    return menuList
  } catch (error) {
    console.log(error)
  }
}

getMenuList()

app.get('/menuList', async (request, response) => {
  try {
    const res = await MenuList.find()
    response.send(res)
  } catch (error) {
    response.status(500).send(error)
  }
})

app.use(passport.initialize())
app.use(passport.session())

app.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

app.get('/google/callback', passport.authenticate('google'), (req, res) => {
  res.redirect(`${REDIRECT_AUTH_URL}#/login?token=${req.token}`)
})

app.get(
  '/user',
  [authService.checkTokenMW, authService.verifyToken],
  (req, res) => {
    if (req.user) {
      res.send(req.user)
    } else {
      res.send({})
    }
  }
)

app.use(
  '/orders',
  [authService.checkTokenMW, authService.verifyToken],
  orderRoute
)

app.listen(PORT, () => {
  console.log('Server started on http://localhost:' + PORT)
})

module.exports = app
