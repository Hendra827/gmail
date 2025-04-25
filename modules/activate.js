const puppeteer = require("puppeteer");
const fs = require("fs-extra");
const { sendMail } = require("./mailer");

async function activateCookies() {
  const cookieFiles = fs.readdirSync("./cookies").filter(f => f.endsWith(".json"));
  let failed = [];

  for (const file of cookieFiles) {
    try {
      const cookies = await fs.readJSON(`./cookies/${file}`);
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setCookie(...cookies);
      await page.goto("https://mail.google.com", { waitUntil: "networkidle2" });

      console.log(`✅ Akun aktif: ${file}`);
      await page.waitForTimeout(30000);
      await browser.close();
    } catch (err) {
      console.error(`❌ Gagal aktivasi: ${file}`);
      failed.push(file);
    }
  }

  if (failed.length > 0) {
    await sendMail(failed);
  }
}

module.exports = { activateCookies };
