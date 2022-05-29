const getUsers = () => {
  return fetch('http://localhost:8081/api/users', {
    method: 'GET',
  }).then(r => (r.status == 201 ? r.json() : null))
}

export { getUsers }
