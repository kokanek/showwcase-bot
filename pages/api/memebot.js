let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig, isItemAlreadyPosted } from '../../utils/firebase';
import { postToShowwcase } from "../../utils";
import { addPostToFirebase, deleteOldPosts } from "../../utils/firebase";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const axios = require("axios");

const authKey = process.env.MEME_BOT_AUTH_KEY;
const apiKey = process.env.RAPID_API_AUTH_KEY;

const botCollectionId = "MemeBot";

// meme bot handler
export default async function handler(req, res) {
  const options = {
    method: 'GET',
    url: 'https://twitter135.p.rapidapi.com/Search/',
    params: { q: '#programmingmemes', count: '20' },
    headers: {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': 'twitter135.p.rapidapi.com'
    }
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const response = await axios.request(options);
  const list = await response.data;
  const tweets = Object.values(list.globalObjects.tweets);
  let imageUrl = null;
  let meme = {};
  let count = 0;
  let itemPosted = false;

  while ((!imageUrl || itemPosted) && count < 20) {
    const index = Math.floor(Math.random() * (tweets.length - 1));
    meme = tweets[index];
    itemPosted = await isItemAlreadyPosted(meme.id_str, db, botCollectionId);
    imageUrl = meme?.entities?.media[0]?.media_url || null;
    count++;
  }

  if (imageUrl) {
    const requestBody = {
      "message": `${meme.full_text}`,
      "mentions": [],
      "images": [imageUrl],
      "code": "",
      "codeLanguage": "",
      "id": -1,
      "videoUrl": "",
      "linkPreviewUrl": "",
    }

    const postResponse = await postToShowwcase(authKey, requestBody);

    await addPostToFirebase(meme.full_text, imageUrl, db, botCollectionId);
    await deleteOldPosts(db, botCollectionId);

    const postResponseJson = await postResponse.json();
    res.status(postResponse.status).json(postResponseJson);
  } else {
    res.status(400).json({ error: 'internal error while posting' });
  }
}
