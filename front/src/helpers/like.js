const like = (id, token) => {
  return fetch(`http://localhost:8081/api/posts/${id}/like`, {
    method: 'POST',
    headers: {
      authorization: token,
    },
  })
}

export { like }
