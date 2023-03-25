let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig } from '../../utils/firebase';
import { postToShowwcase } from "../../utils";
import { getItemToPost } from "../../utils/firebase";
import { addPostToFirebase, deleteOldPosts } from "../../utils/firebase";
import { summarize } from '../../utils/gpt';
const axios = require("axios");

const authKey = process.env.WORLD_NEWS_BOTH_AUTH_KEY;
const apiKey = process.env.RAPID_API_AUTH_KEY;

const botCollectionId = "WorldNewsBot";


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

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const response = await axios.request(options);
  const json = await response.data;

  const article = await getItemToPost(json, "link", db, botCollectionId)
  const summary = await summarize(article.link);

  console.log('reached here 1');
  const requestBody = {
    "title": `JUST IN: from ${article.source} (${article.category})\n`,
    "message": summary,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": article.link,
  }

  console.log('reached here 2');
  const postResponse = await postToShowwcase(authKey, requestBody);

  await addPostToFirebase(article.title, article.link, db, botCollectionId);
  await deleteOldPosts(db, botCollectionId);

  const postResponseJson = await postResponse.json();

  res.status(postResponse.status).json(postResponseJson);
}
