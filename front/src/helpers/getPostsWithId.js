const getPostsWithId = id => {
  return fetch(`http://localhost:8081/api/users/${id}/posts`)
}

export { getPostsWithId }
