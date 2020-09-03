const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const User = require('./models/user')

const NODE_ENV = process.env.NODE_ENV

const CLIENT_ID =
  NODE_ENV === 'development'
    ? process.env.GG_CLIENT_ID_DEV
    : process.env.GG_CLIENT_ID_PROD
const CLIENT_SECRET =
  NODE_ENV === 'development'
    ? process.env.GG_CLIENT_SECRET_DEV
    : process.env.GG_CLIENT_SECRET_PROD
const CALLBACK_URL =
  NODE_ENV === 'development' ? process.env.CB_URL_DEV : process.env.CB_URL_PROD

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    done(null, user)
  })
})

passport.use(
  new GoogleStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      passReqToCallback: true,
    },
    (request, accessToken, refreshToken, profile, done) => {
      User.findOne({ googleId: profile.id }).then(currentUser => {
        if (currentUser) {
          done(null, currentUser)
        } else {
          new User({
            username: profile.displayName,
            googleId: profile.id,
            avatar: profile._json.picture,
            roles:
              profile.email === 'kiettrankm11@gmail.com' ||
              profile.email === 'thutram54@gmail.com'
                ? ['admin']
                : [],
          })
            .save()
            .then(newUser => {
              done(null, newUser)
            })
        }
      })
    }
  )
)
