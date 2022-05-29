const deleteUser = (id, token) => {
  return fetch('http://localhost:8081/api/users/' + id, {
    method: 'DELETE',
    headers: {
      authorization: token,
    },
  })
}

export { deleteUser }
