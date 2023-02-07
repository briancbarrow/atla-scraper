const {
  normalizeURL,
  getURLsFromHTML,
  getCharacterURLs,
  getCharacterInfo,
} = require("./crawl.js");

async function main() {
  console.log("Let's crawl here");
  const urls = await getCharacterURLs(
    "https://avatar.fandom.com/wiki/Category:Characters"
  );
  const character = await getCharacterInfo(urls[0]);
}

main();
