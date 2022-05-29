const updateUser = (objectForm, id, token) => {
  console.log(id)
  return fetch('http://localhost:8081/api/users/' + id, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify(objectForm),
  })
}

export { updateUser }
