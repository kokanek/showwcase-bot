// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import githubTrends from 'github-trends-api';
const authKey = process.env.GITHUB_BOT_AUTH_KEY;

export default async function handler(req, res) {
  const json = await githubTrends();
  console.log('trends: ', json);

  const index = Math.floor(Math.random() * (json.length - 1))
  let repo = json[index];

  const requestBody = {
    "title": "Git trending repo of the day 🏆",
    "message": `Check out this trending${repo.language ? ` ${repo.language}` : ''} repo on github \n 👉🏾 ${repo.reponame} by ${repo.author} \n`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": '',
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": repo.repourl,
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
