const { JSDOM } = require("jsdom");
const fs = require("fs");
normalizeURL = (url) => {
  url = new URL(url);
  host = url.host;
  path = url.pathname.replace(/\/$/, "");
  return host + path;
};

getURLsFromHTML = (htmlBody, baseURL) => {
  // Crawl https://avatar.fandom.com/wiki/Category:Characters
  // find all hrefs that have /wiki/ in them
  //// exclude hrefs that have /wiki/Category: in them
  //// exclude hrefs that have (games) in them
  //// exclude hrefs that have (film) in them
  //// exclude hrefs that have (comics) in them
  //// exclude hrefs that have (pilot) in them
  const dom = new JSDOM(htmlBody, { url: baseURL });
  const hasNextPage = dom.window.document.querySelector(
    ".category-page__pagination-next"
  );
  const categoryBody = dom.window.document.querySelector(
    ".category-page__members"
  );
  const links = categoryBody.querySelectorAll(
    "a[class='category-page__member-link']"
  );
  const filtered = Array.from(links).filter((link) => {
    let shouldInclude = true;
    if (
      link.href.includes(
        "/wiki/Category:" ||
          link.href.includes("(games)") ||
          link.href.includes("(film)") ||
          link.href.includes("(comics)") ||
          link.href.includes("(pilot)")
      )
    ) {
      shouldInclude = false;
    }
    return shouldInclude;
  });
  // turn relative URLs into absolute URLs
  const absoluteURLs = [];
  filtered.forEach((href) => {
    try {
      absoluteURLs.push(new URL(href, baseURL).href);
    } catch (error) {
      console.log("error", error, href);
    }
  });
  return { absoluteURLs, hasNextPage };
};

async function getCharacterURLs(url) {
  console.log("\n");
  console.log("getCharacterURLs", url);
  // get the page
  try {
    const response = await fetch(url);
    if (response.status >= 400) {
      throw new Error("Failed to fetch page");
    }
    if (response.headers.get("content-type").indexOf("text/html") === -1) {
      throw new Error("Not HTML");
    }
    let html = await response.text();
    let result = [];
    let urls = getURLsFromHTML(html, "https://avatar.fandom.com/wiki");
    console.log("**** ABSOLUTE", urls.absoluteURLs[0]);
    if (urls.hasNextPage) {
      const nextHref = urls.hasNextPage.href;
      console.log("nextHref", nextHref);
      const nextURLs = await getCharacterURLs(nextHref);
      console.log("nextURLs", nextURLs.length);
      result = [...urls.absoluteURLs, ...nextURLs];
    } else {
      console.log("URLS NO NEXT PAGE", urls.hasNextPage);
      result = [...result, ...urls.absoluteURLs];
    }
    console.log("result", result.length);
    fs.writeFileSync(`result.json`, JSON.stringify(result), () => `Wrote json`);
    return result;
  } catch (error) {
    console.log("error in crawl", error);
  }
  // get the links
  // filter the links
  // add the links to the queue
  // add the page to the crawled list
}

async function getCharacterInfo(url) {
  const character = {};
  const response = await fetch(url);
  if (response.status >= 400) {
    console.log("Failed to fetch character Info", url);
    return;
  }
  if (response.headers.get("content-type").indexOf("text/html") === -1) {
    console.log(`${url} does Not have HTML`);
    return;
  }
  let html = await response.text();
  const dom = new JSDOM(html, { url: url });
  // Info to collect:

  //// Name
  const name = dom.window.document.querySelector(
    ".portable-infobox [data-source='name']"
  ).textContent;

  //// Images
  const image = dom.window.document.querySelector(".pi-image-thumbnail").src;

  //// Nicknames
  let nicknames = [];
  dom.window.document
    .querySelectorAll("[data-source='nickname'] ul li")
    .forEach((li) => {
      nicknames.push(li.textContent);
    });

  //// Aliases
  let aliases = [];
  dom.window.document
    .querySelectorAll("[data-source='alias'] ul li")
    .forEach((li) => {
      aliases.push(li.textContent);
    });

  //// Nationality
  let nationality = [];
  dom.window.document
    .querySelector("[data-source='nationality'] .pi-data-value")
    .textContent.split(",")
    .forEach((nat) => {
      nationality.push(nat.trim());
    });

  //// Ethnicity
  let ethnicity = [];
  dom.window.document
    .querySelector("[data-source='ethnicity'] .pi-data-value")
    .textContent.split(",")
    .forEach((eth) => {
      ethnicity.push(eth.trim());
    });

  //// Fighting style

  let fightingStyle = [];
  dom.window.document
    .querySelector("[data-source='fightingstyle'] .pi-data-value")
    ?.textContent.split(",")
    .forEach((style) => {
      fightingStyle.push(style.trim());
    });

  //// Born
  let born = dom.window.document.querySelector(
    "[data-source='birth'] .pi-data-value"
  )?.textContent;

  //// Died
  let died = null;
  if (
    dom.window.document.querySelectorAll(
      "[data-source='death'] .pi-data-value ul li"
    )
  ) {
    died = [];
    dom.window.document
      .querySelectorAll("[data-source='death'] .pi-data-value ul li")
      .forEach((li) => {
        died.push(li.textContent);
      });
  } else {
    died = dom.window.document.querySelector(
      "[data-source='death'] .pi-data-value"
    )?.textContent;
  }

  console.log({
    name,
    image,
    nicknames,
    aliases,
    nationality,
    ethnicity,
    fightingStyle,
    born,
    died,
  });

  //// Eye color
  //// Hair color
  //// Skin color
  //// Gender
  //// Weapon
  //// Profession
  //// Affiliation?
  //// Appearances
  //// Voiced by
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  getCharacterURLs,
  getCharacterInfo,
};
