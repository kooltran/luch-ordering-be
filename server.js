const dotenv = require('dotenv')
const mongoose = require('mongoose')
const express = require('express')
const puppeteer = require('puppeteer')
const bodyParser = require('body-parser')
const passport = require('passport')
const path = require('path')
const authService = require('./services/auth.service')
const webpush = require('web-push')
const moment = require('moment')

// const publicVapidKey =
//   'BHAKxU6iUAw82ir5KZIzAjYUzxcj81h5r2HZu6VViXibueksOwHdWur69HV7Ze6Xssxr1j_3dY5L_2SlJ7-ekh8'
// const privateVapidKey = 'Z1RWlWejbCqeTgJcxGoHjGZnOj2IOCRZUAEbhX2ptLk'

const cors = require('cors')
dotenv.config()

const config = require('./config.json')

const MenuList = require('./models/menu')
const orderRoute = require('./routes/orderDish')
const usersRoute = require('./routes/users')

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

// webpush.setVapidDetails('mailto:test@test.com', publicVapidKey, privateVapidKey)

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
  .connect(DB_URL, {
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
    const brower = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    const page = await brower.newPage()

    await page.goto(URL, {
      waitUntil: 'load',
      timeout: 0
    })

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

    const newList = [
      {
        name: 'Cút chiên bơ',
        img: 'https://www.anzi.com.vn/upload/post/food/02012019204836.jpeg',
        price: '35.000đ'
      },
      {
        name: 'Thịt kho tàu',
        img: 'https://www.anzi.com.vn/upload/post/food/15112018120941.jpeg',
        price: '35.000đ'
      },
      {
        name: 'Bò xào cải chua',
        img: 'https://www.anzi.com.vn/upload/post/food/22052019220933.jpeg',
        price: '35.000đ'
      },
      {
        name: 'Cá kho',
        img: 'https://www.anzi.com.vn/upload/post/general/18112018184710.jpeg',
        price: '35.000đ'
      },
      {
        name: 'Tôm rim',
        img: 'https://www.anzi.com.vn/upload/post/general/18112018184710.jpeg',
        price: '35.000đ'
      },
      {
        name: 'Canh bí đỏ',
        img: 'https://www.anzi.com.vn/upload/post/general/18112018184710.jpeg',
        price: '35.000đ'
      },
      {
        name: 'Thịt luộc',
        img: 'https://www.anzi.com.vn/upload/post/food/13112018125039.jpeg',
        price: '35.000đ'
      }
    ]

    await Promise.all(
      menuList.map(async item => {
        const today = moment().startOf('day')
        const { img, name, price } = item
        await MenuList.findOneAndUpdate(
          { name },
          { img, name, price, createdAt: today },
          { upsert: true, new: false }
        )
      })
    )

    // if (existList.length) {
    //   const resList = newList.map((item, idx) => ({
    //     id: existList[idx]._id,
    //     name: item.name,
    //     img: item.img,
    //     price: item.price
    //   }))
    //   resList.map(async (item = {}) =>
    //     MenuList.updateOne({ _id: item.id }, item, { upsert: true })
    //   )
    // }

    // if (existList.length === 0) {
    //   await Promise.all(
    //     menuList.map(async item => {
    //       const { img, name, price } = item;
    //       await MenuList.findOneAndUpdate(
    //         { name },
    //         { img, name, price },
    //         { upsert: true, new: false }
    //       );
    //     })
    //   );
    // } else {
    //   const resList = menuList.map((item, idx) => ({
    //     id: existList[idx]._id,
    //     name: item.name,
    //     img: item.img,
    //     price: item.price
    //   }));
    //   resList.map(async (item = {}) =>
    //     MenuList.updateOne({ _id: item.id }, item, { upsert: true })
    //   );
    // }
    // return menuList
  } catch (error) {
    console.log(error)
  }
}

getMenuList()

//Subscribe Route
// app.post('/subscribe', (req, res) => {
//   // Get pushSubscription object
//   const subscription = req.body
//   res.status(201).json()

//   // Create payload
//   const payload = JSON.stringify({ title: 'Push Test' })

//   // Pass object into sendNotification
//   webpush.sendNotification(subscription, payload).catch(err => console.log(err))
// })

app.get('/menuList', async (request, response) => {
  const today = moment().startOf('day')
  try {
    const res = await MenuList.find({
      createdAt: {
        $gte: today
      }
    })

    // const res = await MenuList.find();
    // console.log(res);
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

// app.get(
//   '/user',
//   [authService.checkTokenMW, authService.verifyToken],
//   (req, res) => {
//     if (req.user) {
//       res.send(req.user)
//     } else {
//       res.send({})
//     }
//   }
// )

app.use(
  '/orders',
  [authService.checkTokenMW, authService.verifyToken],
  orderRoute
)

app.use(
  '/users',
  [authService.checkTokenMW, authService.verifyToken],
  usersRoute
)

app.listen(PORT, () => {
  console.log('Server started on http://localhost:' + PORT)
})

module.exports = app
