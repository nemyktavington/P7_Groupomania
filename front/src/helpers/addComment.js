const addComment = (postId, token, commentContent) => {
  return fetch(`http://localhost:8081/api/posts/${postId}/comment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: token,
    },
    body: JSON.stringify({
      comment: commentContent,
    }),
  })
}

export { addComment }
