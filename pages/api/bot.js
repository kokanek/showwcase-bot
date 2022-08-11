// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const authKey = process.env.SHOWWCASE_AUTH_KEY;

export default async function handler(req, res) {
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
  const json = await response.json();
  const index = Math.floor(Math.random() * (json.length - 1))
  const item = await fetch(`https://hacker-news.firebaseio.com/v0/item/${json[index]}.json?print=pretty`);
  const itemJson = await item.json();

  const requestBody = {
    "message": `Check out this top story trending on Hackernews: \n 👉🏾 ${itemJson.title} \n 🔗 ${itemJson.url}`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "JavaScript",
    "id": -1,
    "videoUrl": ""
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
  console.log(postResponseJson);
  res.status(postResponse.status).json(postResponseJson);
}
