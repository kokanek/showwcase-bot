// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require("axios");

const authKey = process.env.MEME_BOT_AUTH_KEY;
const apiKey = process.env.RAPID_API_AUTH_KEY;

// meme bot handler
export default async function handler(req, res) {
  const options = {
  method: 'GET',
  url: 'https://twitter135.p.rapidapi.com/Search/',
  params: {q: '#programmingmemes', count: '20'},
  headers: {
    'X-RapidAPI-Key': apiKey,
    'X-RapidAPI-Host': 'twitter135.p.rapidapi.com'
  }
};

  const response = await axios.request(options);
  const list = await response.data;
  const tweets = Object.values(list.globalObjects.tweets);
  let imageUrl = null;
  let meme = {};
  let count = 0;
  
  while(!imageUrl && count > 9) {
    const index = Math.floor(Math.random() * (tweets.length - 1));
    meme = tweets[index];
    imageUrl = meme?.entities?.media[0]?.media_url || null;
    count++;
  }

  const requestBody = {
    "message": `https://twitter.com/i/web/status/${meme.id_str}`,
    "mentions": [],
    "images": [imageUrl],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": "",
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
