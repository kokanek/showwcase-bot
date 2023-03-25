let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig } from '../../utils/firebase';
import { postToShowwcase } from "../../utils";
import { getItemToPost } from "../../utils/firebase";
import { addPostToFirebase, deleteOldPosts } from "../../utils/firebase";

const authKey = process.env.FRONTEND_BOT_AUTH_KEY;
const botCollectionId = "FrontendBot";

const introMessages = [
  'Check out this article to up your frontend game: \n 👉🏾',
  'Are you into frontend development? Check out this article 👇🏾 \n',
  'Bet you will learn something new from this frontend article 👇🏾 \n',
  "Don't miss this amazing frontend reference article \n 👉🏾",
  'Got some time? Need to level up your frontend skills? This can help 👇🏾 \n'
]

export default async function handler(req, res) {
  const response = await fetch("https://dev.to/api/articles?tag=frontend");
  const json = await response.json();

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  console.log('reached here 1')
  const article = await getItemToPost(json, "url", db, botCollectionId)

  console.log('reached here 2')
  const introMessageIndex = Math.floor(Math.random() * 4);
  const requestBody = {
    "title": `${article.title}`,
    "message": `${introMessages[introMessageIndex]} \n 🔗 ${article.url}`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "JavaScript",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": article.url,
  }

  console.log('reached here 3')

  const postResponse = await postToShowwcase(authKey, requestBody);

  console.log('reached here 4')

  await addPostToFirebase(article.title, article.url, db, botCollectionId);
  await deleteOldPosts(db, botCollectionId);

  console.log('reached here 5')
  const postResponseJson = await postResponse.json();

  console.log('reached here 6')
  res.status(postResponse.status).json(postResponseJson);
}
