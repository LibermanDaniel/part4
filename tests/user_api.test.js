const bcrypt = require('bcrypt')
const User = require('../models/user')
const mongoose = require('mongoose')
const helper = require('../utils/test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)

const autorization = 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWQiOiI2MmFlNDQwNDM0ODVjMTkxMjhiNGFkMzEiLCJpYXQiOjE2NTU2NDI4MTR9.smQH_rqJPO-CdBML8tM-rwQB4AO6EW_EneIjzX97Y3Y'

describe('There is atleast one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('Creating of a new user succeeds', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'daniel',
      name: 'Daniel Minimoose',
      password: 'passwordAa!123'
    }

    await api
      .post('/api/users')
      .set({ 'Autorization': autorization, Accept: 'application/json' })
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
      .set({ 'Autorization': autorization, Accept: 'application/json' })
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toEqual(usersAtStart)
  })

  test('Creating of a new user with invalid password do not work - length', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'daniel',
      name: 'Daniel Minimoose',
      password: 'pa'
    }

    await api
      .post('/api/users')
      .set({ 'Autorization': autorization, Accept: 'application/json' })
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /aapplication\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
  })

  test('Creating of a new user with invalid password do not work - lowecase', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'daniel',
      name: 'Daniel Minimoose',
      password: 'paaa'
    }

    await api
      .post('/api/users')
      .set({ 'Autorization': autorization, Accept: 'application/json' })
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /aapplication\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
  })

  test('Creating of a new user with invalid password do not work - uppercase', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'daniel',
      name: 'Daniel Minimoose',
      password: 'PAAAA'
    }

    await api
      .post('/api/users')
      .set({ 'Autorization': autorization, Accept: 'application/json' })
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /aapplication\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
  })

  test('Creating of a new user with invalid password do not work - special char', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'daniel',
      name: 'Daniel Minimoose',
      password: '((()()'
    }

    await api
      .post('/api/users')
      .set({ 'Autorization': autorization, Accept: 'application/json' })
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /aapplication\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
  })

  test('Creating of a new user with invalid password do not work - digits', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'daniel',
      name: 'Daniel Minimoose',
      password: 'pa123454'
    }

    await api
      .post('/api/users')
      .set({ 'Autorization': autorization, Accept: 'application/json' })
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /aapplication\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
  })
  test('Creating of a new user with invalid password works', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'daniel',
      name: 'Daniel Minimoose',
      password: 'paAa!86'
    }

    await api
      .post('/api/users')
      .set({ 'Autorization': autorization, Accept: 'application/json' })
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /aapplication\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
  })
  test('Creating of a new user with invalid username do not work - length', async () => {
    const userAtStart = await helper.usersInDb()

    const newUser = {
      username: 'da',
      name: 'Daniel Minimoose',
      password: 'paAasa1234!'
    }

    await api
      .post('/api/users')
      .set({ 'Autorization': autorization, Accept: 'application/json' })
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /aapplication\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(userAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})
