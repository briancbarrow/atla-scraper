const { test, expect } = require("@jest/globals");
const { normalizeURL, getURLsFromHTML } = require("./crawl.js");

const urls = [
  "https://briancbarrow.dev/path/",
  "https://briancbarrow.Dev/path/",
  "https://briancbarrow.dev/path",
  "http://briancbarrow.dev/path/",
];
const twoPathUrls = [
  "http://briancbarrow.dev/path/another/",
  "http://briancbarrow.dev/path/another",
  "https://briancbarrow.dev/path/another",
];
test.each(urls)("normalizeURL %s", (url) => {
  const normalizedURL = normalizeURL(url);
  expect(normalizedURL).toBe("briancbarrow.dev/path");
});

test.each(twoPathUrls)("normalizeURL two paths: %s", (url) => {
  const normalizedURL = normalizeURL(url);
  expect(normalizedURL).toBe("briancbarrow.dev/path/another");
});

test("getURLsFromHTML absolute", () => {
  const htmlBody = `
    <html>
      <body>
        <a href="https://briancbarrow.dev/path/"></a>
      </body>
    </html>
  `;
  const baseURL = "https://briancbarrow.dev";
  const urls = getURLsFromHTML(htmlBody, baseURL);
  expect(urls).toEqual(["https://briancbarrow.dev/path/"]);
});

test("getURLsFromHTML relative", () => {
  const htmlBody = `
    <html>
      <body>
        <a href="/path/test"></a>
      </body>
    </html>
  `;
  const baseURL = "https://briancbarrow.dev";
  const urls = getURLsFromHTML(htmlBody, baseURL);
  expect(urls).toEqual(["https://briancbarrow.dev/path/test"]);
});

test("getURLsFromHTML relative with query string", () => {
  const htmlBody = `
    <html>
      <body>
        <a href="/path/test?query=string"></a>
      </body>
    </html>
  `;
  const baseURL = "https://briancbarrow.dev";
  const urls = getURLsFromHTML(htmlBody, baseURL);
  expect(urls).toEqual(["https://briancbarrow.dev/path/test?query=string"]);
});
