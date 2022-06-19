const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
require('express-async-errors')


usersRouter.post('/', async (req, res) => {
  const { username, name, password } = req.body

  if (!(username) || !(password)) {
    return res.status(400).json({
      error: 'Either username or password field is empty'
    })
  }
  const existingUser = await User.findOne({ username })
  if (existingUser) {
    return res.status(400).json({
      error: 'username must be unique'
    })
  }
  if (!validateUsername(username)) {
    return res.status(400).json({
      error: 'username must have over 3 characters'
    })
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'password must have over 3 characters, one uppercase, one lowercase, one digit, one special character!'
    })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

usersRouter.get('/', async (req, res) => {
  const users = await User.find({}).populate('blogs')
  console.log(users)
  res.json(users)
})

// validators

/**
 * Password must have one upper/lower -case letters, one digit, and one special character
 * Passwords must have length of 3 to 12 characters
 * @param {string} password password provided by the user
 * @returns true of false depends on if the password matches the regex requierments
 */
const validatePassword = (password) => {
  const passRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{3,12}$/
  return passRegex.test(password)
}

/**
 * Username can contain Upper and lower case letters, digits, underscore, and periods
 * Username must have length of 3 to 20 characters
 * @param {string} username username provided by the user
 * @returns true of false depends on if the password matches the regex requierments
 */
const validateUsername = (username) => {
  const usernameRegex = /^[a-z0-9_\.]+.{3,20}$/
  return usernameRegex.test(username)
}


module.exports = usersRouter