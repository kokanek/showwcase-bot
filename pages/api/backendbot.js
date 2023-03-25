let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig } from '../../utils/firebase';
import { postToShowwcase } from "../../utils";
import { getItemToPost } from "../../utils/firebase";
import { addPostToFirebase, deleteOldPosts } from "../../utils/firebase";
import { summarize } from '../../utils/gpt';

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const authKey = process.env.BACKEND_BOT_AUTH_KEY;
const botCollectionId = "BackendBot";

// const introMessages = [
//   'Check out this article to up your backend game: \n 👉🏾',
//   'Are you into backend development? Check out this article 👇🏾 \n',
//   'Bet you will learn something new from this backend article 👇🏾 \n',
//   "Don't miss this amazing backend reference article \n 👉🏾",
//   'Got some time? Need to level up your backend skills? This can help 👇🏾 \n'
// ]

export default async function handler(req, res) {
  const response = await fetch("https://dev.to/api/articles?tag=backend");
  const json = await response.json();

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const article = await getItemToPost(json, "url", db, botCollectionId)
  const summary = await summarize(article.url);

  const requestBody = {
    "title": `${article.title}`,
    "message": summary,
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
