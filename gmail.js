const { saveCookies } = require('./utils/saveCookies');
const { activateCookies } = require('./utils/activateCookies');

const arg = process.argv[2];
if (arg === '--save') saveCookies();
else if (arg === '--activate') activateCookies();
else console.log("❓ Gunakan --save atau --activate");
