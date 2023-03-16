// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
let Parser = require('rss-parser');
let parser = new Parser();
let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
// let { getAnalytics } = require('firebase/analytics');
import { createRequestBody, postToShowwcase } from '../../utils';
import { addPostToFirebase, deleteOldPosts, getItemToPost } from '../../utils/firebase';
import { firebaseConfig } from '../../utils/firebase';

const authKey = process.env.PAUL_GRAHAM_BOTH_AUTH_KEY;
const botCollectionId = "PaulGrahamBot";

export default async function handler(req, res) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  // const analytics = getAnalytics(app);

  const feed = await parser.parseURL('http://www.aaronsw.com/2002/feeds/pgessays.rss');
  const { items } = feed;

  try {
    let itemToPost = await getItemToPost(items, "link", db, botCollectionId)
    const requestBody = createRequestBody(itemToPost);
    const postResponse = await postToShowwcase(authKey, requestBody);

    const postResponseJson = await postResponse.json();
    await addPostToFirebase(itemToPost.title, itemToPost.link, db, botCollectionId);

    await deleteOldPosts(db, botCollectionId);

    res.status(postResponse.status).json(postResponseJson);
  } catch (e) {
    console.log('error: ', e);
    res.status(400).json("Error working with firebase:", e);
  }

}
