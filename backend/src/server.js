require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const cookieSession = require('cookie-session')

const authRoutes = require('./routes/auth')
const apiRoutes = require('./routes/api')
const adminRoutes = require('./routes/admin')

const startWs = require('./realtime/wsServer')

const app = express()

app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())

app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || 'devsecret'],
  maxAge: 24 * 60 * 60 * 1000
}))

// Routes
app.use('/auth', authRoutes)
app.use('/api', apiRoutes)
app.use('/admin', adminRoutes)

const PORT = process.env.PORT || 4000

const server = app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`)
})

startWs(server)
