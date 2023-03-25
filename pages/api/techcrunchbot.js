const axios = require("axios");
let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig } from '../../utils/firebase';
import { postToShowwcase, getItemToPost } from "../../utils";
import { addPostToFirebase, deleteOldPosts } from "../../utils/firebase";

const authKey = process.env.TECHCRUNCH_BOT_AUTH_KEY;
const apiKey = process.env.RAPID_API_AUTH_KEY;

const botCollectionId = "TechcrunchBot";

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

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  let article = await getItemToPost(json, "link", db, botCollectionId)

  const introMessageIndex = Math.floor(Math.random() * introMessages.length);
  const requestBody = {
    "title": `${article.title}`,
    "message": `${introMessages[introMessageIndex]}\n`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": article.link,
  }

  const postResponse = await postToShowwcase(authKey, requestBody);

  await addPostToFirebase(article.title, article.url, db, botCollectionId);
  await deleteOldPosts(db, botCollectionId);

  const postResponseJson = await postResponse.json();
  res.status(postResponse.status).json(postResponseJson);
}
