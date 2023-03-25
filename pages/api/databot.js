const axios = require("axios");
let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig } from '../../utils/firebase';
import { postToShowwcase } from "../../utils";
import { addPostToFirebase, deleteOldPosts, isItemAlreadyPosted } from "../../utils/firebase";

const authKey = process.env.DATA_BOT_AUTH_KEY;
const apiKey = process.env.RAPID_API_AUTH_KEY;
const botCollectionId = "DataBot";

// the data bot handler
export default async function handler(req, res) {
  const options = {
    method: 'GET',
    url: 'https://reddit3.p.rapidapi.com/subreddit',
    params: { url: 'https://www.reddit.com/r/dataisbeautiful' },
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'reddit3.p.rapidapi.com'
    }
  };
  const response = await axios.request(options)
  const json = await response?.data?.posts || [];

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  let found = false;
  let index, item;

  while (!found) {
    index = Math.floor(Math.random() * (json.length - 1))
    item = json[index];

    const isPostedOnce = await isItemAlreadyPosted(item.url, db, botCollectionId);
    if (item.url && (item.url.endsWith(".jpg") || item.url.endsWith(".png")) && !isPostedOnce) {
      found = true
    }
  }

  const requestBody = {
    "title": `${item.title}`,
    "message": `https://www.reddit.com${item.permalink}`,
    "mentions": [],
    "images": [item.url],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": item.url,
  }

  const postResponse = await postToShowwcase(authKey, requestBody);

  await addPostToFirebase(item.title, item.url, db, botCollectionId);
  await deleteOldPosts(db, botCollectionId);

  const postResponseJson = await postResponse.json();
  res.status(postResponse.status).json(postResponseJson);
}