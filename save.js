const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const accounts = require("../accounts.json");

async function saveCookies() {
  for (const acc of accounts) {
    try {
      console.log(`🔐 Login: ${acc.email}`);
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto("https://accounts.google.com/signin");

      await page.type("#identifierId", acc.email);
      await page.click("#identifierNext");
      await page.waitForTimeout(2000);

      await page.type('input[name="password"]', acc.password);
      await page.click("#passwordNext");
      await page.waitForNavigation({ waitUntil: "networkidle2" });

      await page.goto("https://mail.google.com");
      await page.waitForTimeout(10000);

      const cookies = await page.cookies();
      await fs.outputJSON(`cookies/${acc.name}.json`, cookies);
      console.log(`✅ Cookies saved: ${acc.name}`);
      await browser.close();
    } catch (err) {
      console.error(`❌ Gagal login: ${acc.email}`, err.message);
    }
  }
}

module.exports = { saveCookies };
