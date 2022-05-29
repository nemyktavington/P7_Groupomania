const getUser = id => {
  return fetch('http://localhost:8081/api/users/' + id).then(r =>
    r.status == 201 ? r.json() : null
  )
}

export { getUser }
