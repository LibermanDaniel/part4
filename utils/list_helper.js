const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const reducer = (sum, item) => {
    return sum + item.likes
  }
  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (highestValue, item) => {
    return highestValue.likes > item.likes ? highestValue : item
  }
  return blogs.length === 0 ? 0 : blogs.reduce(reducer, 0)
}

const mostBlogs = (blogs) => {
  const authorBlogs = lodash(blogs)
    .groupBy('author')
    .map((obj) => ({
      'author': obj[0].author,
      'blogs': obj.length
    }))
    .value()

  const reducer = (highestValue, item) => {
    return highestValue.blogs > item.blogs ? highestValue : item
  }
  return authorBlogs.length === 0 ? 0 : authorBlogs.reduce(reducer, 0)
}

const mostLikes = (blogs) => {
  const authorLikes = lodash(blogs)
    .groupBy('author')
    .map((obj, key) => ({
      'author': key,
      'likes': lodash.sumBy(obj, 'likes')
    }))
    .value()

  const reducer = (highestValue, item) => {
    return highestValue.likes > item.likes ? highestValue : item
  }

  return authorLikes.length === 0 ? 0 : authorLikes.reduce(reducer, 0)

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
