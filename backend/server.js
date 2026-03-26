require('dotenv').config();
const express = require('express');
const path = require('path');

try {
    require('../bot/bot');
    require('../bot/discord_bot');
} catch (e) {
    console.log("Error starting bots:", e.message);
}

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.listen(PORT, () => {
    console.log(`[SERVER] Express backend is running on port ${PORT}`);
    console.log(`[BOT] Bots (Telegram/Discord) initialized and waiting for messages...`);
});
