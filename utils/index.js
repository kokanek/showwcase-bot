export function createRequestBody(itemToPost, summary) {
  return {
    "title": `${itemToPost.title}`,
    "message": summary,
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
