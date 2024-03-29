let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig, getItemToPost } from '../../utils/firebase';
import { postToShowwcase } from "../../utils";
import { addPostToFirebase, deleteOldPosts } from "../../utils/firebase";
const axios = require('axios');

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const authKey = process.env.TWITTER_BOT_AUTH_KEY;
const rapidApiKey = process.env.RAPID_API_AUTH_KEY;
const tweetpikAuthKey = process.env.TWEETPIK_AUTH_KEY;

const botCollectionId = "TwitterBot";

export default async function handler(req, res) {
  const topics = ['web development', 'React.js']
  const topicIndex = Math.floor(Math.random() * (topics.length - 1))
  const options = {
    method: 'GET',
    url: 'https://twitter154.p.rapidapi.com/search/search',
    params: {
      query: topics[topicIndex],
      section: 'top',
      min_retweets: '10',
      min_likes: '10',
      limit: '20',
      language: 'en'
    },
    headers: {
      'X-RapidAPI-Key': rapidApiKey,
      'X-RapidAPI-Host': 'twitter154.p.rapidapi.com'
    }
  };

  const response = await axios.request(options);
  const topTweets = response.data;

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  let tweet = await getItemToPost(topTweets.results, "tweet_id", db, botCollectionId)
  const tweetId = String(tweet.tweet_id);

  // Get the tweetpik URL here
  const tweetRequest = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: tweetpikAuthKey
    },
    body: JSON.stringify({
      tweetId: tweetId,
      dimension: 'autoSize',
      displayLikes: true,
      displayReplies: true,
      displayRetweets: true
    })
  }
  const tweetResponse = await fetch('https://tweetpik.com/api/images', tweetRequest);
  const tweetScreenshot = await tweetResponse.json();

  // post to showwcase
  const showwcaseRequestBody = {
    "title": 'Straight From Twitter',
    "message": `🔗 👉🏾 https://twitter.com/i/web/status/${tweetId}`,
    "mentions": [],
    "images": [tweetScreenshot.url],
    "code": "",
    "codeLanguage": "",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": '',
  }

  const postResponse = await postToShowwcase(authKey, showwcaseRequestBody);

  await addPostToFirebase(`https://twitter.com/i/web/status/${tweetId}`, tweetScreenshot.url, db, botCollectionId);
  await deleteOldPosts(db, botCollectionId);

  const postResponseJson = await postResponse.json();
  res.status(postResponse.status).json(postResponseJson);
}