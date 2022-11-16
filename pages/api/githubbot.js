// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const authKey = process.env.GITHUB_BOT_AUTH_KEY;

export default async function handler(req, res) {
  const response = await fetch("https://gh-trending-api.herokuapp.com/repositories");
  const json = await response.json();
  
  const index = Math.floor(Math.random() * (json.length - 1))
  let repo = json[index];

  const requestBody = {
    "message": `Check out this trending${repo.language ? ` ${repo.language}` : ''} repo on github \n 👉🏾 ${repo.repositoryName} by ${repo.username} \n`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": '',
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": repo.url,
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
