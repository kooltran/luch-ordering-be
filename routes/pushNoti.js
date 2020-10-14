const express = require('express')
const webpush = require('web-push')

const router = express.Router()

const vapidKeys = webpush.generateVAPIDKeys()

webpush.setVapidDetails(
  'mailto:test@test.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

router.post('/subscribe', (req, res) => {
  console.log(req, 'request')
  // Get pushSubscription object
  const subscription = req.body

  // Send 201 - resource created
  res.send({})

  const payload = JSON.stringify({ title: 'kool tran!!!' })

  // Pass object into sendNotification
  webpush
    .sendNotification(subscription, payload)
    .catch(err => console.error(err))
})

module.exports = router
