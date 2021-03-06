const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
require('express-async-errors')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user')
  response.json(blogs)
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body

  console.log(body)
  const user = await User.findById(body.userId)
  console.log(user)

  if (!(body.likes)) {
    body.likes = 0
  }

  if (body.title && body.url) {
    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  }
  else {
    response.status(400).end()
  }
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  }
  else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

blogsRouter.delete('/:id', async (request, response) => {
  if (request.params.id) {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  }
})

blogsRouter.put('/:id', async (request, response) => {
  if (request.body) {
    await Blog.findByIdAndUpdate(request.params.id, request.body)
    response.status(200).end()
  }
})

module.exports = blogsRouter