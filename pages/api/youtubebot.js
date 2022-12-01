// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require("axios");

const authKey = process.env.YOUTUBE_BOT_AUTH_KEY;
const apiKey = process.env.RAPID_API_AUTH_KEY;
const FREECODECAMP_CHANNEL_ID = 'UC8butISFwT-Wl7EV0hUK0BQ';

// techcrunch bot handler
export default async function handler(req, res) {
  const options = {
    method: 'GET',
    url: 'https://youtube138.p.rapidapi.com/channel/videos/',
    params: {id: FREECODECAMP_CHANNEL_ID, hl: 'en', gl: 'US'},
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'youtube138.p.rapidapi.com'
    }
  };
  
  const response = await axios.request(options);
  const json = await response.data.contents;
  
  const index = Math.floor(Math.random() * (json.length - 1))
  let video = json[index];

  const requestBody = {
    "message": ``,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": `https://www.youtube.com/watch?v=${video.video.videoId}`,
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
