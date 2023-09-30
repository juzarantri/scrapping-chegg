const puppeteer = require("puppeteer");
require("dotenv").config();

const USERNAME_SELECTOR = "#username";
const PASSWORD_SELECTOR = "#password";
const CTA_SELECTOR =
  "#__next > main > div.sc-dkrFOg.bEhLlY > div > form > div.sc-fEXmlR.llqYPH > div.sc-dmctIk.cbdfoh > button"; // Updated selector for the "Sign in" button

async function startBrowser() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  return { browser, page };
}

async function closeBrowser(browser) {
  return browser.close();
}

async function playTest(url) {
  const { browser, page } = await startBrowser();
  page.setViewport({ width: 1366, height: 768 });
  await page.goto(url, { timeout: 60000 });

  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(process.env.CHEGG_USERNAME);

  await page.click(CTA_SELECTOR);

  await page.waitForSelector(PASSWORD_SELECTOR);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(process.env.CHEGG_PASSWORD);

  await page.click(CTA_SELECTOR);
  await page.waitForNavigation();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);
  setInterval(async () => {
    await page.goto("https://expert.chegg.com/qna/authoring/answer");
    console.log(await page.url());
    await page.waitForSelector("#__next > main > div > div");

    await page.waitForSelector(
      "#__next > main > div > div > div.sc-iFoMEM.hQihfE"
    );

    let element = await page.$(
      "#__next > main > div > div > div.sc-iFoMEM.hQihfE"
    );
    let value = await page.evaluate((el) => el.textContent, element);

    if (value.indexOf("Hello, Expert!") == -1) {
      await page.screenshot({ path: `chegg.png` });

      client.messages
        .create({
          body: "Question",
          from: "whatsapp:+14155238886",
          to: `whatsapp:${process.env.MOB_NO}`,
          mediaUrl: process.env.MEDIA_URL,
        })
        .then((message) => console.log(message.sid));
    }
  }, 1000 * 60);

  // Close the browser
  //   await closeBrowser(browser);
}

module.exports = { playTest };
