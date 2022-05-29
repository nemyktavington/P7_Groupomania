const uploadAvatar = (formData, id, token) => {
  return fetch('http://localhost:8081/api/users/' + id + '/upload/avatar', {
    method: 'PUT',
    headers: {
      authorization: token,
    },
    body: formData,
  })
}

export { uploadAvatar }
