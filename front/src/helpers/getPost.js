const getPost = id => {
  return fetch('http://localhost:8081/api/posts/ ' + id).then(r => r.json())
}

export { getPost }
