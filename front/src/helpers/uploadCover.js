const uploadCover = (formData, id, token) => {
  return fetch('http://localhost:8081/api/users/' + id + '/upload/cover', {
    method: 'PUT',
    headers: {
      authorization: token,
    },
    body: formData,
  })
}

export { uploadCover }
