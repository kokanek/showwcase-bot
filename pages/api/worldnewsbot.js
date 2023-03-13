// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require("axios");

const authKey = process.env.WORLD_NEWS_BOTH_AUTH_KEY;
const apiKey = process.env.RAPID_API_AUTH_KEY;

// techcrunch bot handler
export default async function handler(req, res) {
  const options = {
    method: 'GET',
    url: 'https://moka-news.p.rapidapi.com/recent50.php',
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'moka-news.p.rapidapi.com'
    }
  };

  const response = await axios.request(options);
  const json = await response.data;

  let index = Math.floor(Math.random() * (json.length - 1))

  while (json[index].title.length > 80) {
    index = Math.floor(Math.random() * (json.length - 1))
  }

  let article = json[index];

  const requestBody = {
    "title": `${article.title}`,
    "message": `Latest news from ${article.source} (${article.category})\n`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": article.link,
  }

  console.log(requestBody);

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
