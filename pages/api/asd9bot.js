import { chat } from "../../utils/gpt";
import { postToShowwcase } from "../../utils";


const expectedAuthHeader = process.env.ASD9_BOTH_AUTH_HEADER;
const authKey = process.env.ASD9_BOTH_AUTH_KEY;

// asd9bot bot handler
export default async function handler(req, res) {
  const { body } = req;
  console.log('json body: ', body);
  console.log('auth header: ', req.headers.authorization);
  if (req.headers.authorization != `Bearer ${expectedAuthHeader}`) {
    res.status(400).json({ message: 'Authentication error' });
  } else {
    const { message, id } = body;
    const asd9Response = await chat(message);

    const requestBody = {
      "message": asd9Response,
      "mentions": [],
      "images": [],
      "code": "",
      "codeLanguage": "JavaScript",
      "id": -1,
      "videoUrl": "",
      "parentId": id,
      "linkPreviewUrl": "",
    }

    const postResponse = await postToShowwcase(authKey, requestBody);
    const postResponseJson = await postResponse.json();
    res.status(postResponse.status).json(postResponseJson);
  }
}
