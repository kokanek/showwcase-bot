const md5 = require('md5');
let { collection, query, where, getDocs, addDoc, deleteDoc, doc } = require("firebase/firestore");

export const firebaseConfig = {
  apiKey: "AIzaSyD9jM4JvSVSbtNDUUSgrvU996E3SSI5ZjY",
  authDomain: "showwcase-bot.firebaseapp.com",
  projectId: "showwcase-bot",
  storageBucket: "showwcase-bot.appspot.com",
  messagingSenderId: "43460486686",
  appId: "1:43460486686:web:ce78d185326f617f19b00f",
  measurementId: "G-9XLHG7YSJ1"
};

export async function getItemToPost(items, urlKey, db, botCollectionId) {
  let itemToPost = {};

  while (!itemToPost[urlKey]) {
    const index = Math.floor(Math.random() * (items.length - 1));
    const item = items[index];

    const hash = md5(item[urlKey]);
    try {
      const q = query(collection(db, botCollectionId), where("hash", "==", hash));
      const querySnapshot = await getDocs(q);

      let count = 0;
      querySnapshot.forEach(doc => {
        console.log('clashing doc with id: ', doc.id);
        count++;
      })

      if (count > 0) {
        continue;
      } else {
        itemToPost = { ...item, hash: hash };
        break;
      }
    } catch (e) {
      console.error("Error reading from firebase: ", e);
    }
  }

  return itemToPost;
}

export async function addPostToFirebase(title, link, db, botCollectionId) {
  let today = new Date();
  var expirationDate = new Date(new Date().setDate(today.getDate() + 7));

  const hash = md5(link);

  return await addDoc(collection(db, botCollectionId), {
    title: title,
    link: link,
    hash: hash,
    expiration: expirationDate
  });
}

export async function deleteOldPosts(db, botCollectionId) {
  let today = new Date();
  const deleteQuery = query(collection(db, botCollectionId), where("expiration", "<", today));
  const querySnapshot = await getDocs(deleteQuery);
  const idsToDelete = [];

  querySnapshot.forEach(doc => {
    idsToDelete.push(doc.id);
  });

  for (const idToDelete of idsToDelete) {
    console.log('Deleting doc with id: ', idToDelete);
    await deleteDoc(doc(db, botCollectionId, idToDelete));
  }
}