let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig } from '../../utils/firebase';
import { postToShowwcase } from "../../utils";
import { addPostToFirebase, deleteOldPosts, isItemAlreadyPosted } from "../../utils/firebase";
import { summarize } from '../../utils/gpt';

const authKey = process.env.HACKERNEWS_BOT_AUTH_KEY;
const botCollectionId = "HackernewsBot";

async function getArticle(json) {
  const index = Math.floor(Math.random() * (json.length - 1))
  const item = await fetch(`https://hacker-news.firebaseio.com/v0/item/${json[index]}.json?print=pretty`);
  const itemJson = await item.json();

  return itemJson;
}

export default async function handler(req, res) {
  const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty');
  const json = await response.json();
  let article = {};

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  let isPostedOnce = false;

  // keep fetching until we get an article with a url
  while (!article.url || isPostedOnce) {
    article = await getArticle(json);
    isPostedOnce = await isItemAlreadyPosted(article.url, db, botCollectionId);
  }
  const summary = await summarize(article.url);

  const requestBody = {
    "title": `${article.title}`,
    "message": summary,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "",
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
