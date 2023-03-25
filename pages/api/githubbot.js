let { initializeApp } = require('firebase/app');
let { getFirestore } = require("firebase/firestore");
import { firebaseConfig } from '../../utils/firebase';
import { postToShowwcase } from "../../utils";
import { getItemToPost } from "../../utils/firebase";
import { addPostToFirebase, deleteOldPosts } from "../../utils/firebase";

import githubTrends from 'github-trends-api';
const authKey = process.env.GITHUB_BOT_AUTH_KEY;
const botCollectionId = "GithubBot";

export default async function handler(req, res) {
  const json = await githubTrends();

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const repo = await getItemToPost(json, "repourl", db, botCollectionId)

  const requestBody = {
    "title": "Git trending repo of the day 🏆",
    "message": `Check out this trending${repo.language ? ` ${repo.language}` : ''} repo on github \n 👉🏾 ${repo.reponame} by ${repo.author} \n`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": '',
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": repo.repourl,
  }

  const postResponse = await postToShowwcase(authKey, requestBody);

  await addPostToFirebase(repo.language, repo.repourl, db, botCollectionId);
  await deleteOldPosts(db, botCollectionId);

  const postResponseJson = await postResponse.json();
  res.status(postResponse.status).json(postResponseJson);
}
