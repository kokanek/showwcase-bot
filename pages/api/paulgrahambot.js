// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
let Parser = require('rss-parser');
let parser = new Parser();
let { initializeApp } = require('firebase/app');
import { getFirestore } from "firebase/firestore";
const md5 = require('md5');
// let { getAnalytics } = require('firebase/analytics');
let { collection, query, where, getDocs, addDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyD9jM4JvSVSbtNDUUSgrvU996E3SSI5ZjY",
  authDomain: "showwcase-bot.firebaseapp.com",
  projectId: "showwcase-bot",
  storageBucket: "showwcase-bot.appspot.com",
  messagingSenderId: "43460486686",
  appId: "1:43460486686:web:ce78d185326f617f19b00f",
  measurementId: "G-9XLHG7YSJ1"
};

const authKey = process.env.PAUL_GRAHAM_BOTH_AUTH_KEY;
const botCollectionId = "PaulGrahamBot";

export default async function handler(req, res) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  // const analytics = getAnalytics(app);

  const feed = await parser.parseURL('http://www.aaronsw.com/2002/feeds/pgessays.rss');
  const { items } = feed;
  let itemToPost = {};

  while (!itemToPost.link) {
    const index = Math.floor(Math.random() * (items.length - 1));
    const item = items[index];

    const hash = md5(item.link);
    try {
      const q = query(collection(db, botCollectionId), where("hash", "==", hash));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.length > 0) {
        continue;
      } else {
        itemToPost = { ...item, hash: hash };
        break;
      }
    } catch (e) {
      console.error("Error reading from firebase: ", e);
      res.status(400).json("Error reading from firebase:");
    }
  }

  try {
    const requestBody = {
      "title": `${itemToPost.title}`,
      "message": "",
      "mentions": [],
      "images": [],
      "code": "",
      "codeLanguage": "",
      "id": -1,
      "videoUrl": "",
      "linkPreviewUrl": itemToPost.link,
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

    await addDoc(collection(db, botCollectionId), {
      title: itemToPost.title,
      link: itemToPost.link,
      hash: itemToPost.hash
    });

    res.status(postResponse.status).json(postResponseJson);
  } catch (e) {
    res.status(400).json("Error writing to firebase:");
  }

}
