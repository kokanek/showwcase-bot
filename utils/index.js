export function createRequestBody(itemToPost) {
  return {
    "title": `${itemToPost.title}`,
    "message": "",
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": itemToPost.link,
  }
}

export function postToShowwcase(authKey, requestBody) {
  return fetch('https://cache.showwcase.com/threads', {
    method: 'POST',
    headers: {
      Authorization: authKey,
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
}
