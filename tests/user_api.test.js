const bcrypt = require('bcrypt')
const User = require('../models/user')
const helper = require('../utils/test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

describe('There is atleast one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('Creating of a new user succeeds', async () => {
    const userAtStart = await helper.userInDb()

    const newUser = {
      username: 'daniel',
      name: 'Daniel Minimoose',
      password: 'password'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /aapplication\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length + 1)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'superUser',
      password: 'password'
    }
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })
})