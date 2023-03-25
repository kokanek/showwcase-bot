let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig } from '../../utils/firebase';
import { getItemToPost } from "../../utils/firebase";
import { postToShowwcase } from "../../utils";
import { addPostToFirebase, deleteOldPosts } from "../../utils/firebase";

const authKey = process.env.CS_BOT_AUTH_KEY;
const botCollectionId = "CsBot";

const introMessages = [
  'Check out this article to up your core CS knowledge: \n 👉🏾',
  'Do you want to strengthen your CS concepts? Check out this article 👇🏾 \n',
  'Bet you will learn something new from this article 👇🏾 \n',
  "Don't miss this amazing Computer science reference article \n 👉🏾",
  'Got some time? Need to level up your core CS skills? This can help 👇🏾 \n'
]

export default async function handler(req, res) {
  const response = await fetch("https://dev.to/api/articles?tag=cs");
  const json = await response.json();

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const article = await getItemToPost(json, "url", db, botCollectionId)

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

  const postResponse = await postToShowwcase(authKey, requestBody);

  await addPostToFirebase(article.title, article.url, db, botCollectionId);
  await deleteOldPosts(db, botCollectionId);

  const postResponseJson = await postResponse.json();
  res.status(postResponse.status).json(postResponseJson);
}
