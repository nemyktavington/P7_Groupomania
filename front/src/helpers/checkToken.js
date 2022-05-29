const checkToken = token => {
  return fetch(`http://localhost:8081/api/users/me`, {
    method: 'GET',
    headers: {
      authorization: token,
    },
  })
}

export { checkToken }
