const createUser = (email, password) => {
  return fetch('http://localhost:8081/api/users/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
}

export { createUser }
