const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const blogsRouter = require('./controllers/blogs')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

// mongoose connection
const mongoUrl = config.MONGODB_URI
mongoose.connect(mongoUrl)
  .then(() => logger.info('Connected to MongoDB!'))
  .catch(err => logger.error('Error while connecting to MongoDB: ', err.message))

// middleware
app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(middleware.requestLogger)
app.use(middleware.errorHandler)
app.use(middleware.unknownEndpoint)
app.use('/api/blogs', blogsRouter)

module.exports = app