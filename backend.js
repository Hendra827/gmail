const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

const saveCookies = require('./modules/saveCookies');
const activateWithCookies = require('./modules/activateWithCookies');

app.use(cors());
app.use(express.json());

const STATUS_PATH = './status.json';

function loadStatus() {
  if (!fs.existsSync(STATUS_PATH)) fs.writeFileSync(STATUS_PATH, '[]');
  return JSON.parse(fs.readFileSync(STATUS_PATH));
}

function saveStatus(data) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2));
}

app.get('/api/status', (req, res) => {
  const status = loadStatus();
  res.json(status);
});

app.post('/api/accounts', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).send('Missing name or email');
  let status = loadStatus();
  if (status.find(acc => acc.email === email)) return res.status(400).send('Account already exists');
  status.push({ name, email, status: 'pending', lastTried: null });
  saveStatus(status);
  res.send('Account added');
});

app.post('/api/action/:email', async (req, res) => {
  const { cmd } = req.body;
  const email = req.params.email;
  let status = loadStatus();
  const account = status.find(acc => acc.email === email);
  if (!account) return res.status(404).send('Account not found');

  account.lastTried = new Date().toISOString();

  try {
    if (cmd === 'save') {
      await saveCookies(email); // 👉 panggil logic asli
      account.status = 'success';
    } else if (cmd === 'activate') {
      const success = await activateWithCookies(email); // 👉 panggil logic asli
      account.status = success ? 'success' : 'failed';
    } else {
      return res.status(400).send('Unknown command');
    }
  } catch (err) {
    console.error(err);
    account.status = 'failed';
  }

  saveStatus(status);
  res.send(`${cmd} triggered for ${email}`);
});

app.listen(port, () => {
  console.log(`🔥 Gmail Automation Backend running at http://localhost:${port}`);
});
