const mongoose = require('mongoose')
const helper = require('../utils/test_helper')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const autorization = 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWQiOiI2MmFlNDQwNDM0ODVjMTkxMjhiNGFkMzEiLCJpYXQiOjE2NTU2NDI4MTR9.smQH_rqJPO-CdBML8tM-rwQB4AO6EW_EneIjzX97Y3Y'


beforeEach(async () => {
  await Blog.deleteMany({})

  for (let blog of helper.blogList) {
    let blogObject = new Blog(blog)
    await blogObject.save()
  }
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .set({ 'Autorization': autorization, Accept: 'application/json' })
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('there is atleast one blog', async () => {
  const res = await api.get('/api/blogs')
  expect(res.body[0]).toBeDefined()
})

test('the amount of blogs matches the inital amount of blogs', async () => {
  const res = await api.get('/api/blogs')
  expect(res.body).toHaveLength(helper.blogList.length)
})

test('the first blog author is Michael Chan', async () => {
  const res = await api.get('/api/blogs')

  expect(res.body[0].author).toBe('Michael Chan')
})

test('a specific title is within the returned blogs', async () => {
  const res = await api.get('/api/blogs')

  const titles = res.body.map(r => r.title)
  expect(titles).toContain('First class tests')
})

test('the blogs have an ID', async () => {
  const res = await api.get('/api/blogs')

  const ids = res.body.map(r => r.id)

  expect(ids).toBeDefined()
})

test('a valid blog can be added', async () => {

  await api
    .post('/api/blogs')
    .set({ 'Autorization': autorization, Accept: 'application/json' })
    .send(helper.oneBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.blogList.length + 1)

  const titles = blogsAtEnd.map(n => n.title)
  expect(titles).toContain('Go To Statement Considered Harmful 2')
})

test('blog without title or url is not added', async () => {
  const faultyBlog = {
    author: 'Edsger W. Dijkstra',
    likes: 5,
  }

  await api
    .post('/api/blogs')
    .set({ 'Autorization': autorization, Accept: 'application/json' })
    .send(faultyBlog)
    .expect(400)

  const faultyBlog2 = {
    title: 'Go To Statement Considered Harmful 2',
    author: 'Edsger W. Dijkstra',
    likes: 5,
  }

  await api
    .post('/api/blogs')
    .set({ 'Autorization': autorization, Accept: 'application/json' })
    .send(faultyBlog2)
    .expect(400)

  const faultyBlog3 = {
    author: 'Edsger W. Dijkstra',
    likes: 5,
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html'
  }

  await api
    .post('/api/blogs')
    .set({ 'Autorization': autorization, Accept: 'application/json' })
    .send(faultyBlog3)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.blogList.length)
})

test('a blog without likes will default the likes to 0', async () => {
  const oneBlog = {
    title: 'Go To Statement Considered Harmful 2',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
  }

  await api
    .post('/api/blogs')
    .set({ 'Autorization': autorization, Accept: 'application/json' })
    .send(oneBlog)
    .expect(201)

  let blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)

  const oneBlog2 = {
    title: 'Go To Statement Considered Harmful 2',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: ''
  }

  await api
    .post('/api/blogs')
    .set({ 'Autorization': autorization, Accept: 'application/json' })
    .send(oneBlog2)
    .expect(201)

  blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
})


test('a blog can be deleted', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set({ 'Autorization': autorization, Accept: 'application/json' })
    .send()
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()

  expect(blogsAtEnd).toHaveLength(helper.blogList.length - 1)

  const titles = blogsAtEnd.map(r => r.title)

  expect(titles).not.toContain(blogToDelete.title)
})

test('updates a blog successfully', async () => {
  const blogsInDb = await helper.blogsInDb()
  const blogToEdit = blogsInDb[0]
  const edit = { title: 'moi' }

  await api
    .put(`/api/blogs/${blogToEdit.id}`)
    .set({ 'Autorization': autorization, Accept: 'application/json' })
    .send(edit)
    .expect(200)

  const updatedBlogsInDb = await helper.blogsInDb()
  expect(updatedBlogsInDb[0].title).toBe('moi')
})

afterAll(() => {
  mongoose.connection.close()
})
