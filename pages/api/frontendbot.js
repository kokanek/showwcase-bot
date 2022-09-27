// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const authKey = process.env.FRONTEND_BOT_AUTH_KEY;

const introMessages = [
  'Check out this article to up your frontend game: \n 👉🏾',
  'Are you into frontend development? Check out this article 👇🏾 \n',
  'Bet you will learn something new from this frontend article 👇🏾 \n',
  "Don't miss this amazing frontend reference article \n 👉🏾",
  'Got some time? Need to level up your frontend skills? This can help 👇🏾 \n'
]

async function getArticle(json) {
  
  const item = await fetch("https://dev.to/api/articles?tag=frontend");
  const itemJson = await item.json();

  return itemJson;
}

export default async function handler(req, res) {
  const response = await fetch("https://dev.to/api/articles?tag=frontend");
  const json = await response.json();
  
  const index = Math.floor(Math.random() * (json.length - 1))
  let article = json[index];

  const introMessageIndex = Math.floor(Math.random() * 4);
  const requestBody = {
    "message": `${introMessages[introMessageIndex]} ${article.title} \n 🔗 ${article.url}`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "JavaScript",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": article.url,
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
