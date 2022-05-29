const getPosts = () => {
  return fetch('http://localhost:8081/api/posts').then(r =>
    r.status == 201 ? r.json() : null
  )
}

export { getPosts }
