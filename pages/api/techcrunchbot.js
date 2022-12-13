// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require("axios");

const authKey = process.env.TECHCRUNCH_BOT_AUTH_KEY;
const apiKey = process.env.RAPID_API_AUTH_KEY;

const introMessages = [
  "This is trending on Techcrunch: \n 👉🏾"
]

// techcrunch bot handler
export default async function handler(req, res) {
  const options = {
    method: 'GET',
    url: 'https://tech-news3.p.rapidapi.com/techcrunch',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'tech-news3.p.rapidapi.com'
    }
  };
  
  const response = await axios.request(options);
  const json = await response.data;
  
  const index = Math.floor(Math.random() * (json.length - 1))
  let article = json[index];

  const introMessageIndex = Math.floor(Math.random() * introMessages.length);
  const requestBody = {
    "title": "Latest tech news 🗞️",
    "message": `${introMessages[introMessageIndex]} ${article.title} \n`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": article.link,
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
