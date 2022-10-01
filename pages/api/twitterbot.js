
// require some helpers
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const puppeteer = require('puppeteer');

// set some default settings
const uncompressedTweetsDir = 'uncompressed_tweets';
const compressedTweetsDir = 'compressed_tweets';
const compressedFileSuffix = '_compressed';
const jpegCompression = 90;

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
const authKey = process.env.HACKERNEWS_BOT_AUTH_KEY;

async function tweetGrabber(url) {
  console.info(`Working on ${url}`);

  // check see if this URL is from Twitter
  if(!url.includes('twitter.com')){
    return;
  }

  // split tweet url down into an array
  let urlArray = url.match(/^https?:\/\/twitter\.com\/(?:#!\/)?(\w+)\/status(es)?\/(\d+)/);
  // store the tweet ID for file naming
  let id = urlArray[3];

  // fire up browser and open a new page
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
  });

  // go to the selected tweet page, wait until the network is idle before proceeding
  // could DCL be used here?
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
  });

  // look to see if the tweet has been deleted
  if (await page.$(`h1[data-testid="error-detail"]`) !== null) {
    console.log(`Tweet: ${id} looks to have been deleted.`);
    fs.writeFile(`${compressedTweetsDir}/${id}.txt`, `There was an error with this tweet (${id}). Has it been deleted?\r\n\r\n${url}`, function (err) {
      if (err) return console.log(err);
    });
    await browser.close();
    return;
  } else {
    // tweet hasn't been deleted so wait for the tweet to exist in the DOM
    await page.waitForSelector('article[role="article"]');
    // select the tweet in the page
    const tweet = await page.$('article[role="article"]');
    // select the tweets main body text
    const tweetBodyText = await page.$('article[role="article"] div[lang="en"]');
    // select the tweets date
    const tweetDateText = await page.$('article[role="article"] div[dir="auto"] > a[role="link"] > span');

    // we need to manipulate the page as by default the login / sticky header are included in the screenshot
    // await page.evaluate(() => {
    //   // target the sticky header
    //   let topElement = document.querySelector('div[data-testid="titleContainer"]');
    //   // target the sign in and cookie banner
    //   let bottomElement = document.querySelector('#layers > div');

    //   // remove these elements as we don't want them in the screenshot
    //   topElement.parentNode.removeChild(topElement);
    //   bottomElement.parentNode.removeChild(bottomElement);
    // });

    // extract the body and date text
    const bodyText = 'body text'
    const dateText = 'date text'

    // write the tweet text and date to a txt file with the same ID as the screenshot
    fs.writeFile(`${compressedTweetsDir}/${id}.txt`, `${bodyText} - ${dateText}\r\n\r\n${url}`, function (err) {
      if (err) return console.log(err);
    });

    console.log('log file is written');

    // screenshot the tweet, save to uncompressed folder
    await tweet.screenshot({path: `./${uncompressedTweetsDir}/${id}.png`});
    // run the uncompressed image through the Squoosh CLI tool to convert it to a JPEG
    await exec(`squoosh-cli -d ${compressedTweetsDir} --mozjpeg ${jpegCompression} -s ${compressedFileSuffix} ${uncompressedTweetsDir}/${id}.png`);
  }
}

export default async function handler(req, res) {
  await tweetGrabber('https://twitter.com/kokaneka/status/1573367852932923393');

  const requestBody = {
    "message": `Check out this top story trending on Hackernews:`,
    "mentions": [],
    "images": [],
    "code": "",
    "codeLanguage": "JavaScript",
    "id": -1,
    "videoUrl": "",
    "linkPreviewUrl": "",
  }

  res.status(200).json({status: 'ok'});
}

const parent = {
  species: 'Homo sapiens',
  breathe: () => console.log('breathing')
}

const child = Object.create(parent);
console.log(child);