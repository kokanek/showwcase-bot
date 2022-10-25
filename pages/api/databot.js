// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require("axios");

const authKey = process.env.DATA_BOT_AUTH_KEY;
const apiKey = process.env.RAPID_API_REDDIT_KEY;

export default async function handler(req, res) {
  const options = {
    method: 'GET',
    url: 'https://reddit3.p.rapidapi.com/subreddit',
    params: {url: 'https://www.reddit.com/r/dataisbeautiful'},
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'reddit3.p.rapidapi.com'
    }
  };
  const response = await axios.request(options)
  const json = await response?.data?.posts || [];

  let found = false;
  let index, item;

  while(!found) {
    index = Math.floor(Math.random() * (json.length - 1))
    item = json[index];

    console.log('item: ', item);
    if (item.url && (item.url.endsWith(".jpg") || item.url.endsWith(".png"))) {
      found = true
    }
  }

  const requestBody = {
    "message": `${item.title} \n https://www.reddit.com${item.permalink}`,
    "mentions": [],
    "images": [item.url],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": item.url,
  }

  const postResponse = await fetch('https://cache.showwcase.com/threads', {
    method: 'POST',
    headers: {
      Authorization: authKey,
      "Content-Type": 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const postResponseJson = await postResponse.json();
  res.status(postResponse.status).json(postResponseJson);
}